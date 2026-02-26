import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, transactions, products } from "@/src/db/schema";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { AnalyticsClient } from "./analytics-client";
import { SeedDataButton } from "./seed-data-button";

const DAYS_AGO = 365; // 12 months - support monthly filter

export type RawTransaction = {
  productName: string;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
};

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
        columns: { id: true },
      })
    : null;

  let rawTransactions: RawTransaction[] = [];

  if (userStore?.id) {
    const since = new Date();
    since.setDate(since.getDate() - DAYS_AGO);

    const rows = await db
      .select({
        productName: products.name,
        quantity: transactions.quantity,
        totalPrice: transactions.totalPrice,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(products, eq(transactions.productId, products.id))
      .where(
        and(
          eq(transactions.storeId, userStore.id),
          gte(transactions.createdAt, since)
        )
      )
      .orderBy(desc(transactions.createdAt));

    rawTransactions = rows.map((r) => ({
      productName: r.productName,
      quantity: r.quantity,
      totalPrice: r.totalPrice,
      createdAt: r.createdAt,
    }));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs="TERMINAL / ANALYTICS"
          title="ANALYTICS MODULE // BI"
          actions={
            userStore?.id ? (
              <SeedDataButton storeId={userStore.id} />
            ) : undefined
          }
        />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-6">
        <AnalyticsClient
          rawTransactions={rawTransactions}
          hasStore={!!userStore}
        />
      </div>
    </div>
  );
}
