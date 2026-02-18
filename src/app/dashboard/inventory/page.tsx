import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { ProductsTable } from "@/src/components/products-table";

export default async function InventoryPage() {
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

  if (!userStore) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-none">
          <DashboardHeader
            breadcrumbs="TERMINAL / INVENTORY"
            title="FULL ASSET LIST"
          />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-md border border-border bg-card p-8 text-center max-w-md">
            <p className="text-muted-foreground text-sm">
              Buat toko terlebih dahulu untuk mengelola inventori.
            </p>
            <Link
              href="/dashboard/create-store"
              className="mt-4 inline-flex rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Buat Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs="TERMINAL / INVENTORY"
          title="FULL ASSET LIST"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <ProductsTable products={productsList} />
      </div>
    </div>
  );
}
