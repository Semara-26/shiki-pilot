'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { db } from '@/src/db';
import { stores, products, eventLogs } from '@/src/db/schema';

export type DeleteProductResult = { success?: boolean; error?: string };

/**
 * Menghapus produk berdasarkan ID. Hanya produk milik toko user yang login yang bisa dihapus.
 * Nama produk di-fetch dulu untuk dicatat di Event Log, lalu delete + insert log dijalankan dalam transaksi.
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

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.storeId, userStore.id)),
      columns: { name: true },
    });
    if (!product) {
      return { error: 'Produk tidak ditemukan atau tidak dapat dihapus.' };
    }

    const productName = product.name;

    await db.transaction(async (tx) => {
      await tx
        .delete(products)
        .where(and(eq(products.id, id), eq(products.storeId, userStore.id)));
      await tx.insert(eventLogs).values({
        storeId: userStore.id,
        title: 'Asset Terminated',
        detail: productName,
      });
    });

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
