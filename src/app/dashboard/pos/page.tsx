import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { POSClient } from "./pos-client";
import Link from "next/link";

export type POSProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default async function POSPage() {
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
        columns: { id: true },
      })
    : null;

  const productsList: POSProduct[] =
    userStore?.id != null
      ? await db.query.products.findMany({
          where: eq(products.storeId, userStore.id),
          columns: { id: true, name: true, price: true, stock: true },
        })
      : [];

  if (!userStore) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <div className="flex-none">
          <DashboardHeader breadcrumbs="TERMINAL" title="KERANJANG PINTAR // POS" />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-lg border-2 border-ink dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8 text-center">
            <h2 className="font-mono text-base font-black uppercase tracking-wider text-ink dark:text-white">
              Toko Belum Dibuat
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Buat toko terlebih dahulu untuk menggunakan fitur POS.
            </p>
            <Link
              href="/dashboard/create-store"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Buat Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs="TERMINAL / POS"
          title="KERANJANG PINTAR // MICRO-POS"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <POSClient
          products={productsList}
          storeId={userStore.id}
        />
      </div>
    </div>
  );
}
