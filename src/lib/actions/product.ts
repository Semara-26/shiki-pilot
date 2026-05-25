"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, ilike, sql, gte } from "drizzle-orm";
import { z } from "zod";
import { embed, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { createSupabaseClient } from "../supabase/server";
import { db } from "../../db";
import { stores, products, eventLogs } from "../../db/schema";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const EMBEDDING_DIMENSIONS = 768;

const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Nama produk wajib diisi")
    .max(200, "Nama produk maksimal 200 karakter"),
  price: z.coerce
    .number({ error: "Harga harus berupa angka" })
    .int({ error: "Harga harus bilangan bulat" })
    .min(0, { error: "Harga tidak boleh negatif" }),
  stock: z.coerce
    .number({ error: "Stok harus berupa angka" })
    .int({ error: "Stok harus bilangan bulat" })
    .min(0, { error: "Stok tidak boleh negatif" }),
  stockCritical: z.coerce
    .number({ error: "Batas stok kritis harus berupa angka" })
    .int({ error: "Batas stok kritis harus bilangan bulat" })
    .min(0, { error: "Batas stok kritis tidak boleh negatif" })
    .default(10),
  description: z
    .string()
    .min(1, "Deskripsi produk wajib diisi")
    .max(5000, "Deskripsi maksimal 5000 karakter"),
});

export type CreateProductState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    price?: string[];
    stock?: string[];
    stockCritical?: string[];
    description?: string[];
    image?: string[];
  };
};

export async function createProduct(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Anda harus login untuk menambah produk." };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { error: "Buat toko terlebih dahulu." };
    }

    const raw = {
      name: formData.get("name") ?? "",
      price: formData.get("price") ?? "",
      stock: formData.get("stock") ?? "",
      stockCritical: formData.get("stockCritical") ?? "10",
      description: formData.get("description") ?? "",
    };

    const parsed = createProductSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0] ?? "");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      return { fieldErrors };
    }

    const { name, price, stock, stockCritical, description } = parsed.data;

    let imageUrl: string | null = null;
    const imageFile = formData.get("image");
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return {
          fieldErrors: {
            image: ["Format file harus gambar (JPEG, PNG, WebP, atau GIF)."],
          },
        };
      }
      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return {
          fieldErrors: { image: ["Ukuran gambar maksimal 2MB."] },
        };
      }
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpeg", "jpg", "png", "webp", "gif"].includes(ext)
        ? ext
        : "jpg";
      const filePath = `${crypto.randomUUID()}.${safeExt}`;
      const supabase = createSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile, { upsert: false });
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return { error: "Gagal mengunggah gambar. Coba lagi." };
      }
      const { data: urlData } = supabase.storage
        .from("product-images")
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
          ? [
              ...embeddingArray,
              ...new Array(EMBEDDING_DIMENSIONS - embeddingArray.length).fill(
                0,
              ),
            ]
          : embeddingArray;

    await db.insert(products).values({
      storeId: userStore.id,
      name,
      price,
      stock,
      stockCritical,
      description,
      imageUrl,
      embedding,
    });

    await db.insert(eventLogs).values({
      storeId: userStore.id,
      title: "New Asset Registered",
      detail: name,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    // SECURITY F-07: Log detail error di server, kembalikan pesan generik ke client
    console.error("createProduct error:", err);
    return { error: "Gagal menyimpan produk. Coba lagi." };
  }
}

export async function updateProduct(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  try {
    const id = formData.get("id");
    if (typeof id !== "string" || !id) {
      return { error: "ID produk tidak valid." };
    }

    const { userId } = await auth();
    if (!userId) {
      return { error: "Anda harus login untuk mengubah produk." };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { error: "Toko tidak ditemukan." };
    }

    const existing = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.storeId, userStore.id)),
      columns: { id: true, imageUrl: true },
    });
    if (!existing) {
      return { error: "Produk tidak ditemukan atau tidak dapat diubah." };
    }

    const raw = {
      name: formData.get("name") ?? "",
      price: formData.get("price") ?? "",
      stock: formData.get("stock") ?? "",
      stockCritical: formData.get("stockCritical") ?? "10",
      description: formData.get("description") ?? "",
    };

    const parsed = createProductSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0] ?? "");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      return { fieldErrors };
    }

    const { name, price, stock, stockCritical, description } = parsed.data;

    let imageUrl: string | null = existing.imageUrl;
    const imageFile = formData.get("image");
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return {
          fieldErrors: {
            image: ["Format file harus gambar (JPEG, PNG, WebP, atau GIF)."],
          },
        };
      }
      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return {
          fieldErrors: { image: ["Ukuran gambar maksimal 2MB."] },
        };
      }
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpeg", "jpg", "png", "webp", "gif"].includes(ext)
        ? ext
        : "jpg";
      const filePath = `${crypto.randomUUID()}.${safeExt}`;
      const supabase = createSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile, { upsert: false });
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return { error: "Gagal mengunggah gambar. Coba lagi." };
      }
      const { data: urlData } = supabase.storage
        .from("product-images")
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
          ? [
              ...embeddingArray,
              ...new Array(EMBEDDING_DIMENSIONS - embeddingArray.length).fill(
                0,
              ),
            ]
          : embeddingArray;

    await db
      .update(products)
      .set({
        name,
        price,
        stock,
        stockCritical,
        description,
        imageUrl,
        embedding,
      })
      .where(and(eq(products.id, id), eq(products.storeId, userStore.id)));

    await db.insert(eventLogs).values({
      storeId: userStore.id,
      title: "Asset Parameters Updated",
      detail: name,
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");
  } catch (err) {
    // SECURITY F-07: Log detail error di server, kembalikan pesan generik ke client
    console.error("updateProduct error:", err);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }
  redirect("/dashboard/inventory");
}

export type ProcessAiImportResult =
  | { success: true; count: number }
  | { success: false; error: string };

export async function processAiImport(
  rawText: string,
): Promise<ProcessAiImportResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Anda harus login untuk mengimpor produk.",
      };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { success: false, error: "Buat toko terlebih dahulu." };
    }

    const trimmed = rawText?.trim();
    if (!trimmed) {
      return {
        success: false,
        error: "Teks kosong. Ketik atau paste daftar produk.",
      };
    }

    const { object } = await generateObject({
      model: google("gemini-flash-latest"),
      system:
        "Kamu adalah asisten ekstraksi data produk. Ekstrak data produk dari teks mentah yang diberikan.",
      prompt: trimmed,
      schema: z.object({
        items: z.array(
          z.object({
            name: z.string().describe("Nama produk"),
            price: z.number().describe("Harga produk dalam angka bulat"),
            stock: z
              .number()
              .describe(
                "Stok awal produk. Berikan nilai 0 jika tidak disebutkan.",
              ),
            stock_critical: z
              .number()
              .optional()
              .describe(
                "Batas stok minimum/kritis produk. Jika tidak disebutkan di teks, biarkan kosong/undefined.",
              ),
          }),
        ),
      }),
    });

    const validItems = object.items.filter(
      (p) =>
        p &&
        typeof p.name === "string" &&
        typeof p.price === "number" &&
        typeof p.stock === "number",
    );

    if (validItems.length === 0) {
      return {
        success: false,
        error:
          "Tidak ada produk valid untuk disimpan. Coba format teks yang lebih jelas.",
      };
    }

    await db.insert(products).values(
      validItems.map((p) => ({
        storeId: userStore.id,
        name: String(p.name).trim().slice(0, 200),
        price: Math.max(0, Math.floor(p.price)),
        stock: Math.max(0, Math.floor(p.stock)),
        stockCritical:
          p.stock_critical === undefined || p.stock_critical === null
            ? 10
            : Math.max(0, Math.floor(p.stock_critical)),
        description: String(p.name).trim().slice(0, 5000) || "Imported via AI",
      })),
    );

    await db.insert(eventLogs).values({
      storeId: userStore.id,
      title: "New Assets Registered via AI",
      detail: `[${validItems.length}] items`,
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");
    return { success: true, count: validItems.length };
  } catch (err) {
    // SECURITY F-07: Log detail error di server, kembalikan pesan generik ke client
    console.error("processAiImport error:", err);
    return { success: false, error: "Gagal memproses import. Coba lagi." };
  }
}

/**
 * Helper untuk AI Tool: update stockCritical suatu produk berdasarkan nama.
 * Pencarian case-insensitive via ilike.
 */
export async function updateProductStockThreshold(
  storeId: string,
  productName: string,
  newThreshold: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const target = await db.query.products.findFirst({
      where: and(
        eq(products.storeId, storeId),
        ilike(products.name, `%${productName.trim()}%`),
      ),
      columns: { id: true, name: true },
    });

    if (!target) {
      return {
        success: false,
        message: `Produk dengan nama "${productName}" tidak ditemukan di inventaris.`,
      };
    }

    await db
      .update(products)
      .set({ stockCritical: Math.max(0, Math.floor(newThreshold)) })
      .where(eq(products.id, target.id));

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Batas stok kritis untuk "${target.name}" berhasil diperbarui menjadi ${Math.max(0, Math.floor(newThreshold))} unit.`,
    };
  } catch (err) {
    console.error("updateProductStockThreshold error:", err);
    return {
      success: false,
      message:
        "Gagal memperbarui batas stok kritis. Terjadi kesalahan pada server.",
    };
  }
}

/**
 * Helper untuk AI Tool: update stok fisik suatu produk berdasarkan nama.
 * Pencarian case-insensitive via ilike.
 */
export async function updateProductStock(
  storeId: string,
  productName: string,
  operation: "add" | "subtract" | "set",
  quantity: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const target = await db.query.products.findFirst({
      where: and(
        eq(products.storeId, storeId),
        ilike(products.name, `%${productName.trim()}%`),
      ),
      columns: { id: true, name: true, stock: true, stockCritical: true },
    });

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
      columns: { name: true, whatsappNumber: true },
    });

    if (!target) {
      return {
        success: false,
        message: `Produk dengan nama "${productName}" tidak ditemukan di inventaris.`,
      };
    }

    let sqlUpdate;
    const updateConditions = [eq(products.id, target.id)];

    if (operation === "add") {
      sqlUpdate = sql`${products.stock} + ${quantity}`;
    } else if (operation === "subtract") {
      sqlUpdate = sql`${products.stock} - ${quantity}`;
      // Syarat mutlak: stok di DB saat detik eksekusi HARUS lebih besar/sama dengan quantity
      updateConditions.push(gte(products.stock, quantity));
    } else if (operation === "set") {
      sqlUpdate = quantity;
    }

    const updated = await db
      .update(products)
      .set({ stock: sqlUpdate })
      .where(and(...updateConditions))
      .returning({ stock: products.stock });

    if (updated.length === 0) {
      if (operation === "subtract") {
        return {
          success: false,
          message: `Gagal: Stok "${target.name}" berubah atau tidak mencukupi untuk dikurangi ${quantity} unit saat transaksi.`,
        };
      }
      return {
        success: false,
        message: `Gagal memperbarui stok. Terjadi konflik data.`,
      };
    }

    const newStock = updated[0].stock;

    // Trigger Alert WA secara Asynchronous jika stok mencapai kritis
    if (newStock <= target.stockCritical && userStore?.whatsappNumber) {
      const WA_GATEWAY_URL = process.env.WA_GATEWAY_URL;
      const WA_API_KEY = process.env.WA_API_KEY;

      if (WA_GATEWAY_URL && WA_API_KEY) {
        // Sanitasi nomor di sisi pengirim sebelum dikirim ke gateway
        let sanitizedPhone = userStore.whatsappNumber.replace(/\D/g, "");
        if (sanitizedPhone.startsWith("62")) {
          // Sudah format internasional, tidak perlu modifikasi
        } else if (sanitizedPhone.startsWith("0")) {
          sanitizedPhone = "62" + sanitizedPhone.slice(1);
        } else if (sanitizedPhone.length >= 9) {
          sanitizedPhone = "62" + sanitizedPhone;
        }

        fetch(`${WA_GATEWAY_URL}/send-alert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": WA_API_KEY,
          },
          body: JSON.stringify({
            store_name: userStore.name,
            owner_phone: sanitizedPhone,
            alert_type: "critical",
            items: [
              {
                product_name: target.name,
                current_stock: newStock,
                threshold: target.stockCritical,
              },
            ],
          }),
        }).catch((err) => {
          console.error("Gagal kirim WA Alert dari AI Tool:", err);
        });
      }
    }

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Stok fisik untuk "${target.name}" berhasil diperbarui menjadi ${newStock} unit.`,
    };
  } catch (err) {
    console.error("updateProductStock error:", err);
    return {
      success: false,
      message: "Gagal memperbarui stok fisik. Terjadi kesalahan pada server.",
    };
  }
}

/**
 * Helper untuk AI Tool: mengecek stok produk saat ini.
 * Pencarian case-insensitive via ilike.
 */
export async function checkProductStock(
  storeId: string,
  productName: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const target = await db.query.products.findFirst({
      where: and(
        eq(products.storeId, storeId),
        ilike(products.name, `%${productName.trim()}%`),
      ),
      columns: { name: true, stock: true, stockCritical: true },
    });

    if (!target) {
      return {
        success: false,
        message: `Produk dengan nama "${productName}" tidak ditemukan di inventaris.`,
      };
    }

    return {
      success: true,
      message: `Stok produk "${target.name}" saat ini adalah ${target.stock} unit. Batas kritis diatur pada ${target.stockCritical} unit.`,
    };
  } catch (err) {
    console.error("checkProductStock error:", err);
    return {
      success: false,
      message: "Gagal mengecek stok. Terjadi kesalahan pada server.",
    };
  }
}

/**
 * Helper untuk AI Tool: Agregasi data penjualan menggunakan Drizzle Raw SQL.
 * TIDAK menarik data mentah ke Node.js — semua kalkulasi terjadi di sisi database.
 * @param storeId - ID toko yang sedang login
 * @param period - 'daily' | 'weekly' | 'monthly'
 */
export async function getSalesAnalytics(
  storeId: string,
  startDate: string,
  endDate: string,
): Promise<{
  success: boolean;
  message: string;
  data?: {
    totalRevenue: number;
    totalTransactions: number;
    topProduct: string;
    topProductQty: number;
    period: string;
  };
}> {
  try {
    // Query 1: Total pendapatan & jumlah transaksi dalam periode (Atomic DB Aggregation)
    const revenueResult = await db.execute(
      sql`
        SELECT
          COALESCE(SUM(t.total_price), 0) AS total_revenue,
          COUNT(t.id) AS total_transactions
        FROM transactions t
        WHERE t.store_id = ${storeId}
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond'
      `,
    );

    // Query 2: Produk terlaris berdasarkan total kuantitas terjual (Atomic DB Aggregation)
    const topProductResult = await db.execute(
      sql`
        SELECT
          p.name AS product_name,
          SUM(t.quantity) AS total_qty
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.store_id = ${storeId}
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond'
        GROUP BY p.name
        ORDER BY total_qty DESC
        LIMIT 1
      `,
    );

    const revenue = revenueResult[0];
    const topProduct = topProductResult[0];

    const totalRevenue = Number(revenue?.total_revenue ?? 0);
    const totalTransactions = Number(revenue?.total_transactions ?? 0);
    const topProductName =
      (topProduct?.product_name as string) ?? "Belum ada transaksi";
    const topProductQty = Number(topProduct?.total_qty ?? 0);

    const periodLabel = `${startDate} hingga ${endDate}`;

    return {
      success: true,
      message: `Analitik berhasil diambil untuk periode ${periodLabel}.`,
      data: {
        totalRevenue,
        totalTransactions,
        topProduct: topProductName,
        topProductQty,
        period: periodLabel,
      },
    };
  } catch (err) {
    console.error("getSalesAnalytics error:", err);
    return {
      success: false,
      message: "Gagal mengambil data analitik. Terjadi kesalahan pada server.",
    };
  }
}

export async function getAdvancedAnalytics(
  storeId: string,
  startDate: string,
  endDate: string,
  granularity: "daily" | "weekly" | "monthly" = "monthly",
): Promise<{
  success: boolean;
  message: string;
  data?: {
    summary: {
      totalRevenue: number;
      topProduct: string;
      topProductsList: Array<{ name: string; qty: number; revenue: number }>;
      bottomProductsList: Array<{ name: string; qty: number; revenue: number }>;
    };
    growth: string;
    trends: Array<{ period: string; revenue: number }>;
    period: string;
  };
}> {
  try {
    const revenuePromise = db.execute(
      sql`
        SELECT
          COALESCE(SUM(t.total_price), 0) AS total_revenue
        FROM transactions t
        WHERE t.store_id = ${storeId}
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond'
      `,
    );

    const topProductPromise = db.execute(
      sql`
        SELECT
          p.name AS product_name,
          SUM(t.quantity) AS total_qty
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.store_id = ${storeId}
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond'
        GROUP BY p.name
        ORDER BY total_qty DESC
        LIMIT 1
      `,
    );

    const topProductsListPromise = db.execute(
      sql`
        SELECT
          p.name AS product_name,
          SUM(t.quantity) AS total_qty,
          SUM(t.total_price) AS total_revenue
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.store_id = ${storeId}
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond'
        GROUP BY p.name
        ORDER BY total_qty DESC
        LIMIT 5
      `,
    );

    const bottomProductsListPromise = db.execute(
      sql`
        SELECT
          p.name AS product_name,
          SUM(t.quantity) AS total_qty,
          SUM(t.total_price) AS total_revenue
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.store_id = ${storeId}
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond'
        GROUP BY p.name
        ORDER BY total_qty ASC
        LIMIT 5
      `,
    );

    let timeFormatStr = "YYYY-MM";
    if (granularity === "daily") timeFormatStr = "YYYY-MM-DD";
    else if (granularity === "weekly") timeFormatStr = "IYYY-IW";

    const trendsPromise = db.execute(
      sql`
        SELECT 
          TO_CHAR(t.created_at, ${sql.raw(`'${timeFormatStr}'`)}) as period, 
          COALESCE(SUM(t.total_price), 0) as revenue 
        FROM transactions t 
        WHERE t.store_id = ${storeId} 
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond' 
        GROUP BY TO_CHAR(t.created_at, ${sql.raw(`'${timeFormatStr}'`)}) 
        ORDER BY period ASC
      `,
    );

    const [
      revenueResult,
      topProductResult,
      topProductsListResult,
      bottomProductsListResult,
      trendsResult,
    ] = await Promise.all([
      revenuePromise,
      topProductPromise,
      topProductsListPromise,
      bottomProductsListPromise,
      trendsPromise,
    ]);

    const revenue = revenueResult[0];
    const topProduct = topProductResult[0];

    const totalRevenue = Number(revenue?.total_revenue ?? 0);
    const topProductName =
      (topProduct?.product_name as string) ?? "Belum ada transaksi";

    const topProductsList = topProductsListResult.map((row) => ({
      name: row.product_name as string,
      qty: Number(row.total_qty ?? 0),
      revenue: Number(row.total_revenue ?? 0),
    }));

    const bottomProductsList = bottomProductsListResult.map((row) => ({
      name: row.product_name as string,
      qty: Number(row.total_qty ?? 0),
      revenue: Number(row.total_revenue ?? 0),
    }));

    const trends = trendsResult.map((t) => {
      let periodLabel = t.period as string;

      if (granularity === "weekly" && periodLabel.includes("-")) {
        try {
          const parts = periodLabel.split("-");
          const year = parseInt(parts[0], 10);
          const week = parseInt(parts[1].replace("W", ""), 10);

          const jan4 = new Date(year, 0, 4);
          const jan4Day = jan4.getDay() || 7;
          const week1Start = new Date(year, 0, 4 - jan4Day + 1);
          const weekStart = new Date(
            week1Start.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000,
          );
          const weekEnd = new Date(
            weekStart.getTime() + 6 * 24 * 60 * 60 * 1000,
          );

          const months = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ];

          const startStr = `${weekStart.getDate()} ${months[weekStart.getMonth()]}`;
          const endStr = `${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
          periodLabel = `${startStr} - ${endStr}`;
        } catch {}
      } else if (granularity === "monthly" && periodLabel.includes("-")) {
        try {
          const parts = periodLabel.split("-");
          const months = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ];
          periodLabel = `${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
        } catch {}
      } else if (granularity === "daily" && periodLabel.includes("-")) {
        try {
          const parts = periodLabel.split("-");
          const months = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ];
          periodLabel = `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
        } catch {}
      }

      return {
        period: periodLabel,
        revenue: Number(t.revenue ?? 0),
      };
    });

    let growth = "0%";
    if (trends.length >= 2) {
      const lastMonth = trends[trends.length - 1].revenue;
      const prevMonth = trends[trends.length - 2].revenue;
      if (prevMonth > 0) {
        const percentage = ((lastMonth - prevMonth) / prevMonth) * 100;
        growth = `${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%`;
      } else if (lastMonth > 0) {
        growth = "+100%";
      }
    }

    const periodLabel = `${startDate} hingga ${endDate}`;

    return {
      success: true,
      message: `Analitik lanjutan berhasil diambil untuk periode ${periodLabel}.`,
      data: {
        summary: {
          totalRevenue,
          topProduct: topProductName,
          topProductsList,
          bottomProductsList,
        },
        growth,
        trends,
        period: periodLabel,
      },
    };
  } catch (err) {
    console.error("getAdvancedAnalytics error:", err);
    return {
      success: false,
      message:
        "Gagal mengambil data analitik lanjutan. Terjadi kesalahan pada server.",
    };
  }
}

/**
 * Helper untuk Contextual Proactive Insight:
 * Menghitung velocity penjualan harian per produk dan memprediksi
 * produk mana yang akan habis dalam < 3 hari.
 * Semua perhitungan dilakukan di sisi database menggunakan SQL agregasi.
 */
export async function getStockRiskProducts(storeId: string): Promise<{
  success: boolean;
  risks: {
    name: string;
    currentStock: number;
    dailyVelocity: number;
    daysLeft: number;
  }[];
}> {
  try {
    // Hitung rata-rata penjualan harian per produk dalam 7 hari terakhir
    // dan bandingkan dengan stok saat ini
    const rows = await db.execute(
      sql`
        SELECT
          p.name,
          p.stock AS current_stock,
          COALESCE(SUM(t.quantity)::float / 7, 0) AS daily_velocity
        FROM products p
        LEFT JOIN transactions t
          ON t.product_id = p.id
          AND t.store_id = ${storeId}
          AND t.created_at >= NOW() - INTERVAL '7 days'
        WHERE p.store_id = ${storeId}
          AND p.stock > 0
        GROUP BY p.id, p.name, p.stock
        HAVING COALESCE(SUM(t.quantity)::float / 7, 0) > 0
        ORDER BY (p.stock / NULLIF(COALESCE(SUM(t.quantity)::float / 7, 0.001), 0)) ASC
        LIMIT 5
      `,
    );

    const risks = (rows as Record<string, unknown>[])
      .map((row) => {
        const dailyVelocity = Number(row.daily_velocity ?? 0);
        const currentStock = Number(row.current_stock ?? 0);
        const daysLeft =
          dailyVelocity > 0 ? Math.floor(currentStock / dailyVelocity) : 999;
        return {
          name: row.name as string,
          currentStock,
          dailyVelocity: Math.round(dailyVelocity * 10) / 10,
          daysLeft,
        };
      })
      .filter((r) => r.daysLeft < 3);

    return { success: true, risks };
  } catch (err) {
    console.error("getStockRiskProducts error:", err);
    return { success: true, risks: [] }; // fail gracefully — jangan blokir respons utama
  }
}

/**
 * Helper untuk AI Tool: Menghasilkan data laporan CSV dalam format string.
 * Dipakai oleh API route /api/report/generate.
 * Mengembalikan raw CSV string dengan data transaksi dalam periode tertentu.
 */
export async function generateReportData(
  storeId: string,
  startDate: string,
  endDate: string,
): Promise<{
  success: boolean;
  csvContent?: string;
  filename?: string;
  message: string;
}> {
  try {
    const rows = await db.execute(
      sql`
        SELECT
          t.created_at,
          p.name AS product_name,
          t.quantity,
          t.total_price,
          t.payment_type
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.store_id = ${storeId}
          AND t.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp + interval '1 day' - interval '1 microsecond'
        ORDER BY t.created_at DESC
      `,
    );

    const txRows = rows as Record<string, unknown>[];

    if (txRows.length === 0) {
      return {
        success: false,
        message: "Tidak ada data transaksi pada periode yang dipilih.",
      };
    }

    // Build CSV dengan BOM UTF-8 agar Excel membacanya dengan benar
    const header =
      "Tanggal;Nama Produk;Kuantitas;Total Pendapatan (Rp);Metode Bayar";
    const dataRows = txRows.map((row) => {
      const date = new Date(row.created_at as string).toLocaleDateString(
        "id-ID",
      );
      const name = String(row.product_name ?? "").replace(/;/g, ",");
      const qty = Number(row.quantity ?? 0);
      const total = Number(row.total_price ?? 0);
      const payment = String(row.payment_type ?? "");
      return `${date};${name};${qty};${total};${payment}`;
    });

    const totalRevenue = txRows.reduce(
      (s, r) => s + Number(r.total_price ?? 0),
      0,
    );
    const grandTotalRow = `;GRAND TOTAL;${txRows.reduce((s, r) => s + Number(r.quantity ?? 0), 0)};${totalRevenue};`;

    const csvContent =
      "\uFEFF" + [header, ...dataRows, grandTotalRow].join("\n");
    const periodLabel = `${startDate}_sd_${endDate}`;
    const filename = `Laporan_${periodLabel}_ShikiPilot.csv`;

    return {
      success: true,
      csvContent,
      filename,
      message: "Laporan berhasil dibuat.",
    };
  } catch (err) {
    console.error("generateReportData error:", err);
    return {
      success: false,
      message: "Gagal membuat laporan. Terjadi kesalahan pada server.",
    };
  }
}
