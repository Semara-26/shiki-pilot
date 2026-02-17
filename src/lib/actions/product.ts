'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { db } from '../../db';
import { stores } from '../../db/schema';
import { products } from '../../db/schema';

const EMBEDDING_DIMENSIONS = 768;

const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .max(200, 'Nama produk maksimal 200 karakter'),
  price: z.coerce
    .number({ invalid_type_error: 'Harga harus berupa angka' })
    .int('Harga harus bilangan bulat')
    .min(0, 'Harga tidak boleh negatif'),
  stock: z.coerce
    .number({ invalid_type_error: 'Stok harus berupa angka' })
    .int('Stok harus bilangan bulat')
    .min(0, 'Stok tidak boleh negatif'),
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
      const fieldErrors: CreateProductState['fieldErrors'] = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof CreateProductState['fieldErrors'];
        if (path && !fieldErrors[path]) fieldErrors[path] = [];
        if (path) fieldErrors[path]!.push(issue.message);
      }
      return { fieldErrors };
    }

    const { name, price, stock, description } = parsed.data;

    const model = google.embedding('text-embedding-004');
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
      embedding,
    });

    revalidatePath('/dashboard');
  } catch (err) {
    console.error('createProduct error:', err);
    return {
      error:
        err instanceof Error ? err.message : 'Gagal menyimpan produk. Coba lagi.',
    };
  }

  redirect('/dashboard');
}
