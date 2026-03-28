import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { eq, ilike, and } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { ProductsTable } from "@/src/components/products-table";
import { PageContainer } from "@/src/components/page-animation";
import { AiImportButton } from "./ai-import-button";
import { SearchInput } from "@/src/components/search-input";

export const dynamic = 'force-dynamic';

export default async function InventoryPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q;
  const safeQ = q ? q.slice(0, 100) : undefined; // SECURITY: Batasi max 100 karakter untuk mencegah Query DoS
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
      })
    : null;

  const productsList =
    userStore?.id != null
      ? await db.query.products.findMany({
          where: and(
            eq(products.storeId, userStore.id),
            safeQ ? ilike(products.name, `%${safeQ}%`) : undefined
          ),
          columns: {
            id: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
            description: true,
          },
        })
      : [];

  if (!userStore) {
    return (
      <PageContainer className="h-full w-full">
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
      </PageContainer>
    );
  }

  return (
    <PageContainer className="h-full w-full">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-none">
          <DashboardHeader
            breadcrumbs="TERMINAL / INVENTORY"
            title="FULL ASSET LIST"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex w-full justify-between items-center gap-4">
            <SearchInput className="flex-1" />
            <AiImportButton />
          </div>
          <ProductsTable products={productsList} showActions />
          {productsList.length === 0 && q && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Tidak ada produk yang cocok dengan pencarian &quot;{q}&quot;
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
