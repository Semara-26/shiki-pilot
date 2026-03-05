"use client";

import { useState, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface ChartDataSummary {
  revenueOverTime?: { name: string; value: number }[];
  topProducts?: { name: string; value: number }[];
  distribution?: { name: string; value: number }[];
}

interface AiInsightBoxProps {
  chartData: ChartDataSummary;
  /** daily | weekly | monthly */
  timeFilter?: string;
  /** Nama toko/bisnis (opsional, dari profil user) */
  businessName?: string;
  /** @deprecated use timeFilter */
  dateRange?: string;
  className?: string;
}

/** Kompres chartData menjadi teks ringkasan singkat untuk menghemat token API */
function buildPayload(
  chartData: ChartDataSummary,
  timeFilter: string
): { summary: string; productNames: string } {
  const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const totalRevenue = (chartData.revenueOverTime ?? []).reduce(
    (s, d) => s + d.value,
    0
  );

  const topList = (chartData.topProducts ?? []).slice(0, 5);
  const topStr =
    topList.length > 0
      ? topList.map((p) => `${p.name} (${p.value} unit)`).join(", ")
      : "tidak ada data";

  const distList = (chartData.distribution ?? []).slice(0, 5);
  const distStr =
    distList.length > 0
      ? distList.map((p) => `${p.name}: ${fmt(p.value)}`).join(" | ")
      : "tidak ada data";

  const summary = [
    `Periode: ${timeFilter}`,
    `Total Pendapatan: ${fmt(totalRevenue)}`,
    `Produk Terlaris: ${topStr}`,
    `Distribusi Revenue: ${distStr}`,
  ].join(" | ");

  const productNames = [...topList, ...distList]
    .map((p) => p.name)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 10)
    .join(", ");

  return { summary, productNames };
}

async function fetchInsight(
  summary: string,
  productNames: string,
  timeFilter: string,
  businessName?: string
): Promise<string> {
  const res = await fetch("/api/ai/insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chartData: summary,
      productNames,
      timeFilter,
      ...(businessName && { businessName }),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { error?: string }).error ?? "Maaf, tidak dapat memuat insight saat ini."
    );
  }
  return json.insight ?? json.message ?? "";
}

export function AiInsightBox({
  chartData,
  timeFilter,
  dateRange,
  businessName,
  className,
}: AiInsightBoxProps) {
  const filter = timeFilter ?? dateRange ?? "weekly";
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setInsight("");
    try {
      const { summary, productNames } = buildPayload(chartData, filter);
      const text = await fetchInsight(summary, productNames, filter, businessName);
      setInsight(text);
      setHasGenerated(true);
    } catch (err) {
      setInsight(
        err instanceof Error ? err.message : "Maaf, tidak dapat memuat insight saat ini."
      );
    } finally {
      setIsLoading(false);
    }
  }, [chartData, filter, businessName]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border-2 border-ink bg-white p-4 md:p-6 dark:border-white/20 dark:bg-[#0a0a0a]",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-ink dark:text-gray-300">
          AI Insight
        </p>
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="mb-4 flex items-center gap-2 rounded-md border border-primary/50 bg-surface-dark px-4 py-2.5 font-mono text-sm text-white transition-all duration-200 hover:border-primary hover:shadow-[0_0_15px_-5px_rgba(242,13,13,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            Menganalisis...
          </>
        ) : hasGenerated ? (
          <>
            <RefreshCw className="h-4 w-4 text-primary" />
            Regenerate Insight
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-primary" />
            Generate AI Insight
          </>
        )}
      </button>

      {/* Output */}
      {isLoading && (
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 max-w-[90%] animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 max-w-[70%] animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        </div>
      )}
      {!isLoading && insight && (
        <p className="font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {insight}
        </p>
      )}
    </div>
  );
}
