import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, transactions, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { PageContainer } from "@/src/components/page-animation";
import { TransactionsTable } from "@/src/components/transactions-table";

export default async function TransactionsPage() {
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
      })
    : null;

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
          .where(eq(transactions.storeId, userStore.id))
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
          <TransactionsTable transactions={transactionsList} />
        </div>
      </div>
    </PageContainer>
  );
}
