"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
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

async function fetchInsight(
  chartData: ChartDataSummary,
  timeFilter?: string,
  businessName?: string
): Promise<string> {
  const res = await fetch("/api/ai/insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chartData,
      timeFilter: timeFilter ?? "weekly",
      ...(businessName && { businessName }),
    }),
  });
  if (!res.ok) throw new Error("Gagal mengambil insight");
  const json = await res.json();
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

  const loadInsight = useCallback(async () => {
    setIsLoading(true);
    setInsight("");
    try {
      const text = await fetchInsight(chartData, filter, businessName);
      setInsight(text);
    } catch {
      setInsight("Maaf, tidak dapat memuat insight saat ini.");
    } finally {
      setIsLoading(false);
    }
  }, [chartData, filter, businessName]);

  useEffect(() => {
    loadInsight();
  }, [loadInsight]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border-2 border-ink bg-white p-4 md:p-6 dark:border-white/20 dark:bg-[#0a0a0a]",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-ink dark:text-gray-300">
          AI Insight
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 max-w-[90%] animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 max-w-[70%] animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        </div>
      ) : (
        <p className="font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {insight || "Belum ada insight tersedia."}
        </p>
      )}
    </div>
  );
}
