"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, transactions } from "@/src/db/schema";

export type BulkTransactionItem = {
  productId: string;
  quantity: number;
  totalPrice: number;
};

export type BulkTransactionResult =
  | { success: true; count: number }
  | { success: false; error: string };

export async function createBulkTransactions(
  storeId: string,
  items: BulkTransactionItem[]
): Promise<BulkTransactionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Anda harus login." };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore || userStore.id !== storeId) {
      return { success: false, error: "Toko tidak ditemukan atau tidak memiliki akses." };
    }

    if (items.length === 0) {
      return { success: false, error: "Keranjang kosong. Tambah produk terlebih dahulu." };
    }

    const records = items.map((item) => ({
      storeId,
      productId: item.productId,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      type: "out" as const,
    }));

    await db.insert(transactions).values(records);

    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard/pos");
    return { success: true, count: records.length };
  } catch (err) {
    console.error("createBulkTransactions error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyimpan transaksi.",
    };
  }
}
