/**
 * dashboard-data.ts
 *
 * Centralized, cached data-fetching untuk dashboard.
 * Semua query di sini menggunakan `unstable_cache` agar tidak
 * memukul database berulang kali saat navigasi client-side.
 *
 * Revalidation strategy:
 *  - Metrics  → 60 s  (angka stok relatif jarang berubah real-time)
 *  - Products → 60 s
 *  - EventLog → 30 s  (lebih sering berubah karena log aktivitas)
 */

import { unstable_cache } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, products, eventLogs } from "@/src/db/schema";

// ─── Tipe ────────────────────────────────────────────────────────────────────

export type DashboardProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  stockCritical: number;
  imageUrl: string | null;
  description: string;
  createdAt: Date;
};

export type EventLogItem = {
  id: string;
  title: string;
  detail?: string;
  date: string; // ISO string
};

export type DashboardMetrics = {
  totalValue: number;
  totalProducts: number;
  totalStock: number;
  lowStock: number;
};

// ─── 1. Ambil store berdasarkan userId ────────────────────────────────────────

export async function getStoreForDashboard(userId: string) {
  return db.query.stores.findFirst({
    where: eq(stores.userId, userId),
    columns: { id: true, name: true, whatsappNumber: true },
  });
}

// ─── 2. Metrics (total produk, stok, nilai aset, low-stock) ──────────────────
// Cache 60 detik – tag "dashboard-metrics" supaya bisa di-revalidate on-demand

export const getDashboardMetrics = unstable_cache(
  async (storeId: string): Promise<DashboardMetrics> => {
    const allProducts = await db.query.products.findMany({
      where: eq(products.storeId, storeId),
      columns: { price: true, stock: true, stockCritical: true },
    });

    const totalProducts = allProducts.length;
    const totalStock = allProducts.reduce((acc, p) => acc + p.stock, 0);
    const totalValue = allProducts.reduce(
      (acc, p) => acc + p.price * p.stock,
      0
    );
    const lowStock = allProducts.filter(
      (p) => p.stock <= p.stockCritical
    ).length;

    return { totalValue, totalProducts, totalStock, lowStock };
  },
  ["dashboard-metrics"],
  { revalidate: 60, tags: ["dashboard-metrics"] }
);

// ─── 3. Recent products (untuk tabel Recent Assets, limit 10) ─────────────────
// Cache 60 detik

export const getRecentProducts = unstable_cache(
  async (storeId: string): Promise<DashboardProduct[]> => {
    return db.query.products.findMany({
      where: eq(products.storeId, storeId),
      columns: {
        id: true,
        name: true,
        price: true,
        stock: true,
        stockCritical: true,
        imageUrl: true,
        description: true,
        createdAt: true,
      },
      orderBy: [desc(products.createdAt)],
      limit: 10,
    });
  },
  ["dashboard-recent-products"],
  { revalidate: 60, tags: ["dashboard-recent-products"] }
);

// ─── 4. ALL products (untuk chart & distribusi) ───────────────────────────────
// Hanya kolom yang diperlukan chart, cache 60 detik

export const getAllProductsForChart = unstable_cache(
  async (storeId: string) => {
    return db.query.products.findMany({
      where: eq(products.storeId, storeId),
      columns: {
        id: true,
        name: true,
        price: true,
        stock: true,
        stockCritical: true,
        imageUrl: true,
      },
      orderBy: [desc(products.createdAt)],
    });
  },
  ["dashboard-chart-products"],
  { revalidate: 60, tags: ["dashboard-chart-products"] }
);

// ─── 5. Low-stock products (hanya produk kritis) ──────────────────────────────
// Cache 30 detik karena alert ini lebih urgent

export const getLowStockProducts = unstable_cache(
  async (storeId: string): Promise<DashboardProduct[]> => {
    // Drizzle belum support filter `stock <= stockCritical` secara native,
    // jadi kita fetch ringan & filter di aplikasi
    const all = await db.query.products.findMany({
      where: eq(products.storeId, storeId),
      columns: {
        id: true,
        name: true,
        price: true,
        stock: true,
        stockCritical: true,
        imageUrl: true,
        description: true,
        createdAt: true,
      },
    });
    return all.filter((p) => p.stock <= p.stockCritical);
  },
  ["dashboard-low-stock"],
  { revalidate: 30, tags: ["dashboard-low-stock"] }
);

// ─── 6. Event log (aktivitas terbaru, limit 8) ────────────────────────────────
// Cache 30 detik karena log cepat berubah

export const getEventLog = unstable_cache(
  async (storeId: string): Promise<EventLogItem[]> => {
    const rows = await db.query.eventLogs.findMany({
      where: eq(eventLogs.storeId, storeId),
      orderBy: [desc(eventLogs.createdAt)],
      columns: { id: true, title: true, detail: true, createdAt: true },
      limit: 8,
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      detail: row.detail ?? undefined,
      date: new Date(row.createdAt).toISOString(),
    }));
  },
  ["dashboard-event-log"],
  { revalidate: 30, tags: ["dashboard-event-log"] }
);
