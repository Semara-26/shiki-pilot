"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, products, transactions } from "@/src/db/schema";

export type SeedResult = { success: true; count: number } | { success: false; error: string };

export async function seedDummyTransactions(storeId: string): Promise<SeedResult> {
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

    const storeProducts = await db
      .select({ id: products.id, price: products.price })
      .from(products)
      .where(eq(products.storeId, storeId));

    if (storeProducts.length === 0) {
      return { success: false, error: "Tidak ada produk. Tambah produk terlebih dahulu." };
    }

    const MIN_TRANSACTIONS = 50;
    const DAYS_BACK = 60;
    const now = new Date();
    const records: Array<{
      storeId: string;
      productId: string;
      quantity: number;
      totalPrice: number;
      type: string;
      createdAt: Date;
    }> = [];

    for (let i = 0; i < MIN_TRANSACTIONS; i++) {
      const product = storeProducts[Math.floor(Math.random() * storeProducts.length)]!;
      const quantity = Math.floor(Math.random() * 10) + 1;
      const totalPrice = quantity * product.price;

      const daysAgo = Math.floor(Math.random() * DAYS_BACK);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        0,
        0
      );

      records.push({
        storeId,
        productId: product.id,
        quantity,
        totalPrice,
        type: "out",
        createdAt,
      });
    }

    await db.insert(transactions).values(records);

    revalidatePath("/dashboard/analytics");
    return { success: true, count: records.length };
  } catch (err) {
    console.error("seedDummyTransactions error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyuntikkan data.",
    };
  }
}
