"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { SalesChart } from "@/src/components/sales-chart";
import { TopProductsBarChart } from "@/src/components/top-products-bar-chart";
import { ProductDistributionDonut } from "@/src/components/product-distribution-donut";
import type { RawTransaction } from "./page";

export type TimeFilter = "daily" | "weekly" | "monthly";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  const now = new Date();
  const buckets = new Map<string, number>();

  if (filter === "daily") {
    // Last 14 days, aggregate per day. X-axis: "DD MMM"
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const tx of transactions) {
      const d = new Date(tx.createdAt);
      const key = d.toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + tx.totalPrice);
      }
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, value]) => {
        const [y, m, day] = dateStr.split("-").map(Number);
        const short = `${String(day).padStart(2, "0")} ${MONTH_LABELS[m - 1]}`;
        return { name: short, value };
      });
  }

  if (filter === "weekly") {
    // Last 8 weeks, aggregate per week. X-axis: "Week 1" .. "Week 8"
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    for (let w = 0; w < 8; w++) buckets.set(`W${w}`, 0);
    for (const tx of transactions) {
      const d = new Date(tx.createdAt);
      const diffMs = now.getTime() - d.getTime();
      const weeksAgo = Math.floor(diffMs / msPerWeek);
      if (weeksAgo >= 0 && weeksAgo < 8) {
        const key = `W${7 - weeksAgo}`;
        buckets.set(key, (buckets.get(key) ?? 0) + tx.totalPrice);
      }
    }
    return Array.from({ length: 8 }, (_, i) => ({
      name: `Week ${i + 1}`,
      value: buckets.get(`W${i}`) ?? 0,
    }));
  }

  // monthly: Last 12 months. X-axis: "Jan", "Feb", "Mar", ...
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, 0);
  }
  for (const tx of transactions) {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + tx.totalPrice);
    }
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [, mStr] = key.split("-");
      const m = parseInt(mStr, 10);
      return { name: MONTH_LABELS[m - 1], value };
    });
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

const DAYS_BY_FILTER: Record<TimeFilter, number> = {
  daily: 14,
  weekly: 56, // 8 weeks
  monthly: 365, // 12 months
};

export function AnalyticsClient({ rawTransactions, hasStore }: AnalyticsClientProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("weekly");
  const txs = rawTransactions.length > 0 ? rawTransactions : FALLBACK_RAW;

  const filteredTransactions = useMemo(() => {
    const daysBack = DAYS_BY_FILTER[timeFilter];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    cutoff.setHours(0, 0, 0, 0);
    return txs.filter((tx) => new Date(tx.createdAt) >= cutoff);
  }, [txs, timeFilter]);

  const revenueOverTimeData = useMemo(
    () => processRevenueOverTime(filteredTransactions, timeFilter),
    [filteredTransactions, timeFilter]
  );
  const topProductsData = useMemo(
    () => processTopProducts(filteredTransactions),
    [filteredTransactions]
  );
  const distributionData = useMemo(
    () => processDistribution(filteredTransactions),
    [filteredTransactions]
  );

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
            title="PRODUK TERLARIS (UNIT TERJUAL)"
            className="h-full"
          />
        </div>
        <div className="h-[320px] min-h-0">
          <ProductDistributionDonut
            data={distributionData}
            title="KONTRIBUSI PENDAPATAN"
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
