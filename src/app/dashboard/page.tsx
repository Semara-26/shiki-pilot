import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { MetricsRow } from "@/src/components/metrics-row";
import { ProductsTable } from "@/src/components/products-table";
import { GrowthChart } from "@/src/components/growth-chart";
import { EventLog } from "@/src/components/event-log";

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
          },
        })
      : [];

  const totalRevenue =
    productsList.reduce((sum, p) => sum + p.price * Math.max(0, p.stock), 0) || 0;

  const metrics = [
    {
      label: "TR_REV",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(totalRevenue),
      change: 2.4,
      changeLabel: "vs last month",
    },
    {
      label: "AU_COUNT",
      value: productsList.length,
      change: productsList.length > 0 ? 1 : 0,
      changeLabel: "products",
    },
    {
      label: "STOCK_ACTIVE",
      value: productsList.filter((p) => p.stock > 0).length,
      change: 0,
      changeLabel: "in stock",
    },
    {
      label: "OUT_OF_STOCK",
      value: productsList.filter((p) => p.stock === 0).length,
      change: -1,
      changeLabel: "items",
    },
  ];

  const chartData = [
    { name: "W1", value: 12, fullLabel: "Week 1" },
    { name: "W2", value: 19, fullLabel: "Week 2" },
    { name: "W3", value: 15, fullLabel: "Week 3" },
    { name: "W4", value: 24, fullLabel: "Week 4" },
  ];

  const eventLogItems = [
    {
      id: "1",
      title: "New Order",
      detail: "Order #1024 — 2 items",
      timestamp: "14:32",
    },
    {
      id: "2",
      title: "Stock Update",
      detail: "Product stock synced",
      timestamp: "14:28",
    },
    {
      id: "3",
      title: "Product Added",
      detail: productsList[0]?.name ?? "New product",
      timestamp: "13:15",
    },
  ];

  if (!userStore) {
    return (
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
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none">
        <DashboardHeader />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <MetricsRow metrics={metrics} />
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 h-[300px]">
            <GrowthChart data={chartData} title="GROWTH" />
            <EventLog events={eventLogItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
