'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { stores } from '../../db/schema';

export type StoreInfoForPrefs = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  businessType: string | null;
  contactEmail: string | null;
  phone: string | null;
  whatsappNumber: string;
  address: string;
};

const updateStoreInfoSchema = z.object({
  name: z.string().min(1, 'Nama toko wajib diisi').max(100).optional(),
  businessType: z.string().max(50).optional().nullable(),
  contactEmail: z.union([z.string().email(), z.literal('')]).optional(),
  phone: z.string().max(30).optional().nullable(),
  whatsappNumber: z.string().min(10).max(15).regex(/^(08|62)\d+$/).optional(),
  address: z.string().min(10).max(500).optional(),
});

const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama toko wajib diisi')
    .max(100, 'Nama toko maksimal 100 karakter'),
  whatsapp_number: z.string()
    .min(10, 'Nomor WhatsApp minimal 10 digit')
    .max(15, 'Nomor WhatsApp maksimal 15 digit')
    .regex(/^(08|62)\d+$/, 'Nomor WhatsApp hanya boleh berisi angka dan wajib diawali 08 atau 62'),
  address: z.string()
    .min(10, 'Alamat minimal 10 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
});

export type CreateStoreState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    whatsapp_number?: string[];
    address?: string[];
    description?: string[];
  };
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function createStore(
  _prevState: CreateStoreState,
  formData: FormData
): Promise<CreateStoreState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login untuk membuat toko.' };
    }

    const existingUserStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });

    if (existingUserStore) {
      return { error: 'Anda sudah memiliki toko. Satu akun hanya dapat memiliki satu toko.' };
    }

    const raw = {
      name: formData.get('name') ?? '',
      whatsapp_number: formData.get('whatsapp_number') ?? '',
      address: formData.get('address') ?? '',
      description: formData.get('description') ?? '',
    };

    const parsed = createStoreSchema.safeParse({
      name: raw.name,
      whatsapp_number: raw.whatsapp_number,
      address: raw.address,
      description: raw.description === '' ? undefined : raw.description,
    });

    if (!parsed.success) {
      const fieldErrors: CreateStoreState['fieldErrors'] = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as 'name' | 'description' | 'whatsapp_number' | 'address';
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path]!.push(issue.message);
      }
      return { fieldErrors };
    }

    const { name, whatsapp_number, address, description } = parsed.data;
    let slug = generateSlug(name);

    const existing = await db.query.stores.findFirst({
      where: eq(stores.slug, slug),
      columns: { id: true },
    });

    if (existing) {
      slug = `${slug}-${randomSuffix()}`;
    }

    await db.insert(stores).values({
      userId,
      name,
      slug,
      whatsappNumber: whatsapp_number,
      address,
      description: description || null,
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    // SECURITY F-07: Log detail error di server, kembalikan pesan generik ke client
    console.error('createStore error:', err);
    if (err instanceof Error && err.message.includes('unique')) {
      if (err.message.includes('whatsapp_number') || err.message.includes('whatsappNumber')) {
        return { error: 'Nomor WhatsApp sudah digunakan oleh toko lain.' };
      }
      return { error: 'Nama toko sudah digunakan, coba nama lain.' };
    }
    return { error: 'Gagal membuat toko. Coba lagi.' };
  }
}

/** Ambil data toko berdasarkan userId (untuk System Preferences) */
export async function getStoreByUserId(): Promise<StoreInfoForPrefs | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const store = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: {
        id: true,
        name: true,
        slug: true,
        description: true,
        businessType: true,
        contactEmail: true,
        phone: true,
        whatsappNumber: true,
        address: true,
      },
    });

    return store ?? null;
  } catch (err) {
    console.error('getStoreByUserId error:', err);
    return null;
  }
}

export type UpdateStoreInfoState = { success?: boolean; error?: string };

/** Update info toko (Store Info tab di System Preferences) */
export async function updateStoreInfo(
  _prevState: UpdateStoreInfoState | null,
  data: {
    name?: string;
    businessType?: string | null;
    contactEmail?: string | null;
    phone?: string | null;
    whatsappNumber?: string;
    address?: string;
  }
): Promise<UpdateStoreInfoState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login untuk menyimpan perubahan.' };
    }

    const parsed = updateStoreInfoSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' };
    }

    const store = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });

    if (!store) {
      return { error: 'Toko tidak ditemukan. Buat toko terlebih dahulu.' };
    }

    const updates: Partial<{
      name: string;
      businessType: string | null;
      contactEmail: string | null;
      phone: string | null;
      whatsappNumber: string;
      address: string;
    }> = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.businessType !== undefined) updates.businessType = parsed.data.businessType === '' ? null : parsed.data.businessType;
    if (parsed.data.contactEmail !== undefined) updates.contactEmail = parsed.data.contactEmail === '' ? null : parsed.data.contactEmail;
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
    if (parsed.data.whatsappNumber !== undefined) updates.whatsappNumber = parsed.data.whatsappNumber;
    if (parsed.data.address !== undefined) updates.address = parsed.data.address;

    if (Object.keys(updates).length === 0) {
      return { success: true };
    }

    await db.update(stores).set(updates).where(eq(stores.id, store.id));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    // SECURITY F-07: Log detail error di server, kembalikan pesan generik ke client
    console.error('updateStoreInfo error:', err);
    if (err instanceof Error && err.message.includes('unique')) {
      if (err.message.includes('whatsapp_number') || err.message.includes('whatsappNumber')) {
        return { error: 'Nomor WhatsApp sudah digunakan oleh toko lain.' };
      }
    }
    return { error: 'Gagal menyimpan perubahan. Coba lagi.' };
  }
}
