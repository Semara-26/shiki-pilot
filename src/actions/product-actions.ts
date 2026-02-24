'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { db } from '@/src/db';
import { stores, products } from '@/src/db/schema';

export type DeleteProductResult = { success?: boolean; error?: string };

/**
 * Menghapus produk berdasarkan ID. Hanya produk milik toko user yang login yang bisa dihapus.
 */
export async function deleteProduct(id: string): Promise<DeleteProductResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login untuk menghapus produk.' };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { error: 'Toko tidak ditemukan.' };
    }

    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.storeId, userStore.id)));

    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('deleteProduct error:', err);
    return {
      error:
        err instanceof Error ? err.message : 'Gagal menghapus produk. Coba lagi.',
    };
  }
}
