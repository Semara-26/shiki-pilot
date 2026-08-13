import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "@/src/db";
import { stores, transactions, transactionItems, products } from "@/src/db/schema";
import { Suspense } from "react";
import { DashboardHeaderServer } from "@/src/components/dashboard-header-server";
import { AnalyticsClient } from "./analytics-client";
import { ChartSkeleton } from "@/src/components/ui/phantom-skeleton";
import { StatisticsTour } from "@/src/components/onboarding/statistics-tour";

const DAYS_AGO = 365; // 12 months - support monthly filter

export type RawTransaction = {
  productName: string;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
};

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* 3 top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartSkeleton minHeight={120} />
        <ChartSkeleton minHeight={120} />
        <ChartSkeleton minHeight={120} />
      </div>
      {/* Main chart */}
      <ChartSkeleton minHeight={400} />
      {/* Bottom charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartSkeleton minHeight={300} />
        <ChartSkeleton minHeight={300} />
      </div>
    </div>
  );
}

async function AnalyticsDataWrapper({
  storeId,
  storeName,
}: {
  storeId: string | undefined;
  storeName: string | undefined;
}) {
  let rawTransactions: RawTransaction[] = [];

  if (storeId) {
    const since = new Date();
    since.setDate(since.getDate() - DAYS_AGO);

    const rows = await db
      .select({
        productName: products.name,
        quantity: transactionItems.quantity,
        totalPrice: transactionItems.subtotal,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(
        transactionItems,
        eq(transactionItems.transactionId, transactions.id)
      )
      .innerJoin(products, eq(transactionItems.productId, products.id))
      .where(
        and(eq(transactions.storeId, storeId), gte(transactions.createdAt, since))
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
    <AnalyticsClient
      rawTransactions={rawTransactions}
      hasStore={!!storeId}
      businessName={storeName}
    />
  );
}

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
        columns: { id: true, name: true },
      })
    : null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="flex-none">
        <DashboardHeaderServer storeId={userStore?.id} title="STATISTIK" />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-6">
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsDataWrapper storeId={userStore?.id} storeName={userStore?.name} />
        </Suspense>
        <StatisticsTour />
      </div>
    </div>
  );
}
