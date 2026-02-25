"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { SalesChart } from "@/src/components/sales-chart";
import { TopProductsBarChart } from "@/src/components/top-products-bar-chart";
import { ProductDistributionDonut } from "@/src/components/product-distribution-donut";
import type { RawTransaction } from "./page";

export type TimeFilter = "daily" | "weekly" | "monthly";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Fallback raw transactions saat DB kosong */
const FALLBACK_RAW: RawTransaction[] = (() => {
  const products = ["Raja Tuna", "Kerupuk Tuna Bawang", "Sarden Premium", "Abon Tuna Pedas", "Fish Ball"];
  const out: RawTransaction[] = [];
  const now = new Date();
  for (let i = 0; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (20 - i));
    const product = products[i % products.length];
    const qty = 2 + (i % 5);
    const price = [28500, 15600, 18900, 22000, 9800][i % 5];
    out.push({
      productName: product,
      quantity: qty,
      totalPrice: price * qty,
      createdAt: d,
    });
  }
  return out;
})();

interface AnalyticsClientProps {
  rawTransactions: RawTransaction[];
  hasStore: boolean;
}

function processRevenueOverTime(
  transactions: RawTransaction[],
  filter: TimeFilter
): { name: string; value: number }[] {
  if (transactions.length === 0) return [];

  const buckets = new Map<string, number>();

  for (const tx of transactions) {
    const d = new Date(tx.createdAt);
    let key: string;
    if (filter === "daily") {
      // Group by date string (YYYY-MM-DD)
      key = d.toISOString().slice(0, 10);
    } else if (filter === "weekly") {
      key = DAY_LABELS[d.getDay()];
    } else {
      const weekOfMonth = Math.ceil(d.getDate() / 7);
      key = `Week ${weekOfMonth}`;
    }
    buckets.set(key, (buckets.get(key) ?? 0) + tx.totalPrice);
  }

  if (filter === "daily") {
    const dates = Array.from(buckets.keys()).sort();
    return dates.slice(-7).map((dateStr) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      const short = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
      return { name: short, value: buckets.get(dateStr) ?? 0 };
    });
  }

  const order =
    filter === "weekly"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["Week 1", "Week 2", "Week 3", "Week 4"];

  return order.map((name) => ({ name, value: buckets.get(name) ?? 0 }));
}

function processTopProducts(transactions: RawTransaction[]): { name: string; value: number }[] {
  const byProduct = new Map<string, number>();
  for (const tx of transactions) {
    byProduct.set(tx.productName, (byProduct.get(tx.productName) ?? 0) + tx.quantity);
  }
  return Array.from(byProduct.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function processDistribution(transactions: RawTransaction[]): { name: string; value: number }[] {
  const byProduct = new Map<string, number>();
  for (const tx of transactions) {
    byProduct.set(tx.productName, (byProduct.get(tx.productName) ?? 0) + tx.totalPrice);
  }
  return Array.from(byProduct.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function AnalyticsClient({ rawTransactions, hasStore }: AnalyticsClientProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("weekly");
  const txs = rawTransactions.length > 0 ? rawTransactions : FALLBACK_RAW;

  const revenueOverTimeData = useMemo(
    () => processRevenueOverTime(txs, timeFilter),
    [txs, timeFilter]
  );
  const topProductsData = useMemo(() => processTopProducts(txs), [txs]);
  const distributionData = useMemo(() => processDistribution(txs), [txs]);

  if (!hasStore) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-ink dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink/20 dark:border-white/20 bg-paper dark:bg-white/5">
            <BarChart3 className="h-7 w-7 text-ink dark:text-white" />
          </div>
          <h2 className="font-mono text-base font-black uppercase tracking-wider text-ink dark:text-white">
            Toko Belum Dibuat
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Buat toko terlebih dahulu untuk melihat analytics penjualan.
          </p>
          <Link
            href="/dashboard/create-store"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Buat Toko
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Revenue Over Time + Time Filter Toggle */}
      <div className="rounded-lg border-2 border-ink bg-white p-6 dark:border-white/20 dark:bg-[#0a0a0a]">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold uppercase tracking-widest text-ink dark:text-gray-300">
            REVENUE OVER TIME
          </p>
          <div className="flex rounded-md border-2 border-ink dark:border-white/20 p-0.5">
            {(["daily", "weekly", "monthly"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTimeFilter(f)}
                className={`
                  px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors
                  ${timeFilter === f
                    ? "bg-primary text-primary-foreground dark:bg-[#22d3ee] dark:text-[#0a0a0a]"
                    : "text-ink dark:text-gray-400 hover:text-primary dark:hover:text-[#22d3ee]"}
                `}
              >
                {f === "daily" ? "Daily" : f === "weekly" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[320px] min-h-0 w-full">
          <SalesChart
            data={revenueOverTimeData.length > 0 ? revenueOverTimeData : [{ name: "—", value: 0 }]}
            embedded
            className="h-full"
          />
        </div>
      </div>

      {/* Row 2: Top Products + Distribution */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-[320px] min-h-0">
          <TopProductsBarChart
            data={topProductsData}
            title="TOP PRODUCTS (VOLUME)"
            className="h-full"
          />
        </div>
        <div className="h-[320px] min-h-0">
          <ProductDistributionDonut
            data={distributionData}
            title="REVENUE DISTRIBUTION"
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
