"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, sql, and, gte, inArray } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, transactions, products } from "@/src/db/schema";

export type BulkTransactionItem = {
  productId: string;
  quantity: number;
  paymentType: 'cash' | 'qris_statis';
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

    // --- Validasi stok & ambil harga terkini dari DB sebelum memulai transaksi ---
    const productIds = items.map((item) => item.productId);
    const currentStocks = await db
      .select({ id: products.id, name: products.name, stock: products.stock, price: products.price })
      .from(products)
      .where(inArray(products.id, productIds));

    for (const item of items) {
      const product = currentStocks.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: "Produk tidak ditemukan di database." };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Stok "${product.name}" tidak mencukupi (tersisa ${product.stock}, diminta ${item.quantity}).`,
        };
      }
    }

    // SECURITY F-04: totalPrice dihitung dari harga DB — tidak mempercayai nilai yang dikirim client
    const records = items.map((item) => {
      const product = currentStocks.find((p) => p.id === item.productId)!;
      return {
        storeId,
        productId: item.productId,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
        type: "out" as const,
        paymentType: item.paymentType,
      };
    });

    // --- Gunakan db.transaction() agar insert transaksi + update stok bersifat atomik ---
    await db.transaction(async (tx) => {
      // Step 1: Catat semua transaksi penjualan
      await tx.insert(transactions).values(records);

      // Step 2: Kurangi stok tiap produk sesuai quantity yang dibeli
      for (const item of items) {
        const updated = await tx
          .update(products)
          .set({
            // Pengurangan stok menggunakan SQL expression agar atomic di level database
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(
            and(
              eq(products.id, item.productId),
              // Safety check: pastikan stok tidak turun ke negatif
              gte(products.stock, item.quantity)
            )
          )
          .returning({ id: products.id });

        // Jika tidak ada baris yang ter-update, stok tidak mencukupi — rollback
        if (updated.length === 0) {
          throw new Error(`Stok produk berubah saat transaksi berlangsung. Coba lagi.`);
        }
      }
    });

    // Revalidasi semua halaman yang menampilkan data stok atau transaksi
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/analytics");
    return { success: true, count: records.length };
  } catch (err) {
    // SECURITY F-07: Log detail error di server, kembalikan pesan generik ke client
    console.error("createBulkTransactions error:", err);
    return {
      success: false,
      error: "Gagal menyimpan transaksi. Silakan coba lagi.",
    };
  }
}
