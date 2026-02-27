'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { embed, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createSupabaseClient } from '../supabase/server';
import { db } from '../../db';
import { stores, products, eventLogs } from '../../db/schema';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EMBEDDING_DIMENSIONS = 768;

const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .max(200, 'Nama produk maksimal 200 karakter'),
  price: z.coerce
    .number({ error: 'Harga harus berupa angka' })
    .int({ error: 'Harga harus bilangan bulat' })
    .min(0, { error: 'Harga tidak boleh negatif' }),
  stock: z.coerce
    .number({ error: 'Stok harus berupa angka' })
    .int({ error: 'Stok harus bilangan bulat' })
    .min(0, { error: 'Stok tidak boleh negatif' }),
  description: z
    .string()
    .min(1, 'Deskripsi produk wajib diisi')
    .max(5000, 'Deskripsi maksimal 5000 karakter'),
});

export type CreateProductState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    price?: string[];
    stock?: string[];
    description?: string[];
    image?: string[];
  };
};

export async function createProduct(
  _prevState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login untuk menambah produk.' };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { error: 'Buat toko terlebih dahulu.' };
    }

    const raw = {
      name: formData.get('name') ?? '',
      price: formData.get('price') ?? '',
      stock: formData.get('stock') ?? '',
      description: formData.get('description') ?? '',
    };

    const parsed = createProductSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0] ?? '');
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      return { fieldErrors };
    }

    const { name, price, stock, description } = parsed.data;

    let imageUrl: string | null = null;
    const imageFile = formData.get('image');
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return {
          fieldErrors: { image: ['Format file harus gambar (JPEG, PNG, WebP, atau GIF).'] },
        };
      }
      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return {
          fieldErrors: { image: ['Ukuran gambar maksimal 2MB.'] },
        };
      }
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
      const filePath = `${crypto.randomUUID()}.${safeExt}`;
      const supabase = createSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, { upsert: false });
      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return { error: 'Gagal mengunggah gambar. Coba lagi.' };
      }
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    const model = google.textEmbeddingModel("gemini-embedding-001");
    const { embedding: rawEmbedding } = await embed({
      model,
      value: description,
    });

    const embeddingArray = Array.isArray(rawEmbedding)
      ? rawEmbedding
      : (rawEmbedding as unknown as number[]);
    const embedding =
      embeddingArray.length > EMBEDDING_DIMENSIONS
        ? embeddingArray.slice(0, EMBEDDING_DIMENSIONS)
        : embeddingArray.length < EMBEDDING_DIMENSIONS
          ? [...embeddingArray, ...new Array(EMBEDDING_DIMENSIONS - embeddingArray.length).fill(0)]
          : embeddingArray;

    await db.insert(products).values({
      storeId: userStore.id,
      name,
      price,
      stock,
      description,
      imageUrl,
      embedding,
    });

    await db.insert(eventLogs).values({
      storeId: userStore.id,
      title: 'New Asset Registered',
      detail: name,
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('createProduct error:', err);
    return {
      error:
        err instanceof Error ? err.message : 'Gagal menyimpan produk. Coba lagi.',
    };
  }
}

export async function updateProduct(
  _prevState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  try {
    const id = formData.get('id');
    if (typeof id !== 'string' || !id) {
      return { error: 'ID produk tidak valid.' };
    }

    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login untuk mengubah produk.' };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { error: 'Toko tidak ditemukan.' };
    }

    const existing = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.storeId, userStore.id)),
      columns: { id: true, imageUrl: true },
    });
    if (!existing) {
      return { error: 'Produk tidak ditemukan atau tidak dapat diubah.' };
    }

    const raw = {
      name: formData.get('name') ?? '',
      price: formData.get('price') ?? '',
      stock: formData.get('stock') ?? '',
      description: formData.get('description') ?? '',
    };

    const parsed = createProductSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0] ?? '');
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      return { fieldErrors };
    }

    const { name, price, stock, description } = parsed.data;

    let imageUrl: string | null = existing.imageUrl;
    const imageFile = formData.get('image');
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return {
          fieldErrors: { image: ['Format file harus gambar (JPEG, PNG, WebP, atau GIF).'] },
        };
      }
      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return {
          fieldErrors: { image: ['Ukuran gambar maksimal 2MB.'] },
        };
      }
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
      const filePath = `${crypto.randomUUID()}.${safeExt}`;
      const supabase = createSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, { upsert: false });
      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return { error: 'Gagal mengunggah gambar. Coba lagi.' };
      }
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    const model = google.textEmbeddingModel("gemini-embedding-001");
    const { embedding: rawEmbedding } = await embed({
      model,
      value: description,
    });

    const embeddingArray = Array.isArray(rawEmbedding)
      ? rawEmbedding
      : (rawEmbedding as unknown as number[]);
    const embedding =
      embeddingArray.length > EMBEDDING_DIMENSIONS
        ? embeddingArray.slice(0, EMBEDDING_DIMENSIONS)
        : embeddingArray.length < EMBEDDING_DIMENSIONS
          ? [...embeddingArray, ...new Array(EMBEDDING_DIMENSIONS - embeddingArray.length).fill(0)]
          : embeddingArray;

    await db
      .update(products)
      .set({
        name,
        price,
        stock,
        description,
        imageUrl,
        embedding,
      })
      .where(and(eq(products.id, id), eq(products.storeId, userStore.id)));

    await db.insert(eventLogs).values({
      storeId: userStore.id,
      title: 'Asset Parameters Updated',
      detail: name,
    });

    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard');
  } catch (err) {
    console.error('updateProduct error:', err);
    return {
      error:
        err instanceof Error ? err.message : 'Gagal menyimpan perubahan. Coba lagi.',
    };
  }
  redirect('/dashboard/inventory');
}

const AI_IMPORT_SYSTEM_PROMPT = `Kamu adalah API ekstraksi data. Ubah teks mentah berikut yang berisi daftar produk menjadi format JSON Array murni (tanpa block code markdown \`\`\`json). Setiap objek harus memiliki key: 'name' (string), 'price' (number integer, hilangkan Rp/titik/koma), dan 'stock' (number, berikan nilai 0 jika tidak disebutkan di teks). Contoh output wajib: [{"name": "Kopi Susu", "price": 5000, "stock": 0}]`;

export type ProcessAiImportResult = { success: true; count: number } | { success: false; error: string };

export async function processAiImport(rawText: string): Promise<ProcessAiImportResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Anda harus login untuk mengimpor produk.' };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { success: false, error: 'Buat toko terlebih dahulu.' };
    }

    const trimmed = rawText?.trim();
    if (!trimmed) {
      return { success: false, error: 'Teks kosong. Ketik atau paste daftar produk.' };
    }

    const { text } = await generateText({
      model: google('gemini-flash-latest'),
      system: AI_IMPORT_SYSTEM_PROMPT,
      prompt: trimmed,
    });

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned) as Array<{ name: string; price: number; stock: number }>;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: false, error: 'AI tidak menemukan produk valid. Coba format teks yang lebih jelas.' };
    }

    const validItems = parsed.filter(
      (p) => p && typeof p.name === 'string' && typeof p.price === 'number' && typeof p.stock === 'number'
    );
    if (validItems.length === 0) {
      return { success: false, error: 'Tidak ada produk valid untuk disimpan.' };
    }

    await db.insert(products).values(
      validItems.map((p) => ({
        storeId: userStore.id,
        name: String(p.name).trim().slice(0, 200),
        price: Math.max(0, Math.floor(p.price)),
        stock: Math.max(0, Math.floor(p.stock)),
        description: String(p.name).trim().slice(0, 5000) || 'Imported via AI',
      }))
    );

    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard');
    return { success: true, count: validItems.length };
  } catch (err) {
    console.error('processAiImport error:', err);
    const message = err instanceof Error ? err.message : 'Gagal memproses import. Coba lagi.';
    return { success: false, error: message };
  }
}
