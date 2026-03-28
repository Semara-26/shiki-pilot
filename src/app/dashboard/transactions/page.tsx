import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, transactions, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { PageContainer } from "@/src/components/page-animation";
import { TransactionsTable } from "@/src/components/transactions-table";
import { TransactionFilters } from "@/src/components/transaction-filters";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage(props: {
  searchParams?: Promise<{ id?: string; start?: string; end?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
      })
    : null;

  const conditions = userStore ? [eq(transactions.storeId, userStore.id)] : [];

  if (searchParams?.id) {
    const safeId = searchParams.id.slice(0, 100); // SECURITY: Batasi max 100 karakter untuk mencegah Query DoS
    conditions.push(sql`${transactions.id}::text ILIKE ${'%' + safeId + '%'}`);
  }

  // SECURITY: Validasi ketat format YYYY-MM-DD untuk mencegah Invalid Date crash (Unhandled Exception)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (searchParams?.start && dateRegex.test(searchParams.start)) {
    const startDate = new Date(searchParams.start + 'T00:00:00.000Z');
    if (!isNaN(startDate.getTime())) {
      conditions.push(gte(transactions.createdAt, startDate));
    }
  }

  if (searchParams?.end && dateRegex.test(searchParams.end)) {
    const endDate = new Date(searchParams.end + 'T23:59:59.999Z');
    if (!isNaN(endDate.getTime())) {
      conditions.push(lte(transactions.createdAt, endDate));
    }
  }

  const transactionsList =
    userStore?.id != null
      ? await db
          .select({
            id: transactions.id,
            quantity: transactions.quantity,
            totalPrice: transactions.totalPrice,
            type: transactions.type,
            paymentType: transactions.paymentType,
            createdAt: transactions.createdAt,
            productId: transactions.productId,
            productName: products.name,
            productPrice: products.price,
          })
          .from(transactions)
          .leftJoin(products, eq(transactions.productId, products.id))
          .where(and(...conditions))
          .orderBy(desc(transactions.createdAt))
      : [];

  if (!userStore) {
    return (
      <PageContainer className="h-full w-full">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-none">
            <DashboardHeader
              breadcrumbs="TERMINAL / TRANSACTIONS"
              title="RIWAYAT TRANSAKSI"
            />
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="rounded-md border border-border bg-card p-8 text-center max-w-md">
              <p className="text-muted-foreground text-sm">
                Buat toko terlebih dahulu untuk melihat riwayat transaksi.
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
            breadcrumbs="TERMINAL / TRANSACTIONS"
            title="RIWAYAT TRANSAKSI"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <TransactionFilters />
          <TransactionsTable transactions={transactionsList} />
          {transactionsList.length === 0 && searchParams && Object.keys(searchParams).length > 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Tidak ada transaksi yang cocok dengan filter yang diterapkan.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
