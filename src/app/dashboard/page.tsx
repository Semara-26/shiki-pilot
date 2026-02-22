import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { MetricsRow, type MetricProduct } from "@/src/components/metrics-row";
import { ProductsTable } from "@/src/components/products-table";
import { GrowthChart } from "@/src/components/growth-chart";
import { AssetDonutChart } from "@/src/components/asset-donut-chart";
import { EventLog } from "@/src/components/event-log";
import { PageContainer } from "@/src/components/page-animation";

export default async function DashboardPage() {
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
      })
    : null;

  const productsList =
    userStore?.id != null
      ? await db.query.products.findMany({
          where: eq(products.storeId, userStore.id),
          columns: {
            id: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            description: true,
            createdAt: true,
          },
        })
      : [];

  // 1. Hitung statistik dari data products
  const totalProducts = productsList.length;
  const totalStock = productsList.reduce((acc, product) => acc + product.stock, 0);
  const totalValue = productsList.reduce(
    (acc, product) => acc + product.price * product.stock,
    0
  );
  const lowStock = productsList.filter((product) => product.stock < 10).length;

  // 2. Format Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 3. Bungkus dalam objek 'metrics' agar sesuai dengan props komponen
  const metrics = {
    totalValue: formatRupiah(totalValue),
    totalProducts: totalProducts,
    totalStock: totalStock,
    lowStock: lowStock,
  };

  const stockChartData = productsList.slice(0, 5).map((p) => ({
    name: p.name,
    value: p.stock,
  }));

  const recentProductsForLog = [...productsList]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const eventLogItems = recentProductsForLog.map((p) => ({
    id: p.id,
    title: "New Asset Registered",
    detail: p.name,
    date: new Date(p.createdAt).toISOString(),
  }));

  if (!userStore) {
    return (
      <PageContainer className="h-full w-full">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-none">
            <DashboardHeader breadcrumbs="TERMINAL" title="WELCOME" />
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex min-h-full items-center justify-center">
              <div className="rounded-md border border-border bg-card p-8 text-center max-w-md">
                <h1 className="text-xl font-semibold text-foreground mb-2">
                  Selamat Datang di Cockpit
                </h1>
                <p className="text-muted-foreground mb-6 text-sm">
                  Buat toko pertama Anda untuk mulai mengelola produk dan chat.
                </p>
                <Link
                  href="/dashboard/create-store"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  + Buat Toko Pertama
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="h-full w-full">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-none">
          <DashboardHeader />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            <MetricsRow
              totalValue={metrics.totalValue}
              totalProducts={metrics.totalProducts}
              totalStock={metrics.totalStock}
              lowStock={metrics.lowStock}
              products={productsList as MetricProduct[]}
            />
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Recent assets
                </p>
                <Link
                  href="/dashboard/inventory"
                  className="font-mono text-xs text-primary hover:underline"
                >
                  View full list →
                </Link>
              </div>
              <ProductsTable products={productsList.slice(0, 5)} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 h-[350px]">
              <GrowthChart data={stockChartData} title="CURRENT STOCK LEVELS" className="h-full" />
              <AssetDonutChart data={productsList} title="ASSET DISTRIBUTION" className="h-full" />
              <EventLog events={eventLogItems} className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
