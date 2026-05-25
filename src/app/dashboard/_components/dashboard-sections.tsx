/**
 * _components/ — Server Components khusus Dashboard
 *
 * File ini berisi komponen-komponen async yang masing-masing
 * bertanggung jawab mengambil datanya sendiri dari DB/cache,
 * sehingga bisa di-Suspense secara independen di page.tsx.
 */

import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, Settings2 } from "lucide-react";

import {
  getDashboardMetrics,
  getRecentProducts,
  getAllProductsForChart,
  getLowStockProducts,
  getEventLog,
} from "@/src/lib/dashboard-data";
import { getWaStatus } from "@/src/lib/actions/wa";

import { DashboardHeader } from "@/src/components/dashboard-header";
import { MetricsRow, type MetricProduct } from "@/src/components/metrics-row";
import { ProductsTable } from "@/src/components/products-table";
import { LowStockAlert } from "@/src/components/low-stock-alert";
import { GrowthChart } from "@/src/components/growth-chart";
import { AssetDonutChart } from "@/src/components/asset-donut-chart";
import { EventLog } from "@/src/components/event-log";

// ─── Skeleton helpers (reuse from loading.tsx patterns) ───────────────────────

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-md bg-secondary/50 p-4">
          <div className="mb-2 h-3 w-20 rounded-md bg-secondary/70" />
          <div className="h-8 w-24 rounded-md bg-secondary/70" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-md bg-secondary/50">
      <div className="border-b border-border/50 px-4 py-4">
        <div className="h-4 w-full rounded-md bg-secondary/70" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 border-b border-border/30 px-4 py-4">
          <div className="h-4 w-12 rounded-md bg-secondary/70" />
          <div className="h-4 flex-1 max-w-[200px] rounded-md bg-secondary/70" />
          <div className="h-4 w-16 rounded-md bg-secondary/70" />
          <div className="h-4 w-16 rounded-md bg-secondary/70" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-md bg-secondary/50 h-full min-h-[300px]" />
  );
}

// ─── 1. MetricsSection — 4 kartu angka paling atas ───────────────────────────

async function MetricsSection({ storeId }: { storeId: string }) {
  const metrics = await getDashboardMetrics(storeId);
  const chartProducts = await getAllProductsForChart(storeId);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <MetricsRow
      totalValue={formatRupiah(metrics.totalValue)}
      totalProducts={metrics.totalProducts}
      totalStock={metrics.totalStock}
      lowStock={metrics.lowStock}
      products={chartProducts as MetricProduct[]}
    />
  );
}

// ─── 2. LowStockSection — alert stok kritis ───────────────────────────────────

async function LowStockSection({ storeId }: { storeId: string }) {
  const lowProducts = await getLowStockProducts(storeId);
  return <LowStockAlert products={lowProducts} />;
}

// ─── 3. WaAlertSection — banner WhatsApp disconnected ─────────────────────────

async function WaAlertSection() {
  const waStatus = await getWaStatus();
  if (waStatus.connected) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500 dark:bg-red-500/5">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-red-500/20 p-2">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-mono text-sm font-bold uppercase tracking-tight">
            System Alert: WhatsApp Disconnected
          </h4>
          <p className="font-mono text-xs opacity-80">
            WhatsApp alerts for low stock will not be sent until reconnected.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard?setup=wa"
        className="flex items-center gap-2 rounded border border-red-500/50 bg-red-500 px-3 py-1.5 font-mono text-xs font-bold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <Settings2 className="h-4 w-4" />
        RECONNECT NOW
      </Link>
    </div>
  );
}

// ─── 4. RecentAssetsSection — tabel 10 produk terbaru ─────────────────────────

async function RecentAssetsSection({ storeId }: { storeId: string }) {
  // limit(10) + orderBy(desc(createdAt)) sudah diterapkan di getRecentProducts
  const recent = await getRecentProducts(storeId);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
          RECENT ASSETS
        </p>
        <Link
          href="/dashboard/inventory"
          className="font-mono text-xs text-primary hover:text-primary-hover dark:hover:text-primary/80 hover:underline"
        >
          View full list →
        </Link>
      </div>
      <ProductsTable products={recent} />
    </div>
  );
}

// ─── 5. ChartsSection — Growth Chart + Donut + Event Log ─────────────────────

async function ChartsSection({ storeId }: { storeId: string }) {
  const [chartProducts, logItems] = await Promise.all([
    getAllProductsForChart(storeId),
    getEventLog(storeId),
  ]);

  const stockChartData = chartProducts.map((p) => ({
    name: p.name,
    value: p.stock,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 lg:min-h-[350px]">
      <div className="min-h-[300px] w-full lg:h-full">
        <GrowthChart
          data={stockChartData}
          title="CURRENT STOCK LEVELS"
          className="h-full"
        />
      </div>
      <div className="min-h-[350px] w-full lg:h-full">
        <AssetDonutChart
          data={chartProducts}
          title="ASSET DISTRIBUTION"
          className="h-full"
        />
      </div>
      <div className="min-h-[300px] w-full lg:h-full">
        <EventLog events={logItems} className="h-full" />
      </div>
    </div>
  );
}

// ─── Export utama: DashboardSections ─────────────────────────────────────────
// Ini yang dipanggil oleh page.tsx — mengkomposisi semua section
// dengan Suspense individual agar setiap bagian stream secara independen.

export async function DashboardSections({ storeId }: { storeId: string }) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsSection storeId={storeId} />
      </Suspense>

      <Suspense fallback={null}>
        <LowStockSection storeId={storeId} />
      </Suspense>

      <Suspense fallback={null}>
        <WaAlertSection />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentAssetsSection storeId={storeId} />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 lg:min-h-[350px]">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        }
      >
        <ChartsSection storeId={storeId} />
      </Suspense>
    </div>
  );
}

// ─── DashboardHeaderServer ────────────────────────────────────────────────────
// Async wrapper agar DashboardHeader bisa mengambil datanya sendiri
// tanpa harus dioper dari page.tsx.

export async function DashboardHeaderServer({ storeId }: { storeId: string }) {
  const products = await getAllProductsForChart(storeId);
  const headerProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
  }));
  return <DashboardHeader products={headerProducts} />;
}
