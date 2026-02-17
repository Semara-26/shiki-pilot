'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { stores } from '../../db/schema';

const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama toko wajib diisi')
    .max(100, 'Nama toko maksimal 100 karakter'),
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
  let result: CreateStoreState;

  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login untuk membuat toko.' };
    }

    const raw = {
      name: formData.get('name') ?? '',
      description: formData.get('description') ?? '',
    };

    const parsed = createStoreSchema.safeParse({
      name: raw.name,
      description: raw.description === '' ? undefined : raw.description,
    });

    if (!parsed.success) {
      const fieldErrors: CreateStoreState['fieldErrors'] = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as 'name' | 'description';
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path]!.push(issue.message);
      }
      return { fieldErrors };
    }

    const { name, description } = parsed.data;
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
      description: description || null,
    });

    revalidatePath('/dashboard');
    result = { success: true };
  } catch (err) {
    console.error('createStore error:', err);
    return {
      error:
        err instanceof Error ? err.message : 'Gagal membuat toko. Coba lagi.',
    };
  }

  redirect('/dashboard');
}
