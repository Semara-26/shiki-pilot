"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/src/lib/utils";

const NERV_COLORS = [
  "#f20d0d",
  "#991b1b",
  "#450a0a",
  "#262626",
  "#7f1d1d",
];


function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format singkat untuk Indonesia: M = Miliar, Jt = Juta; di bawah itu angka penuh. */
function formatRupiahShort(value: number): string {
  if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}M`; // M = Miliar
  if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}Jt`; // Jt = Juta
  return formatRupiah(value); // Penuh, misal Rp 500.000
}

export interface AssetDonutProduct {
  name: string;
  price: number;
  stock: number;
}

interface AssetDonutChartProps {
  data: AssetDonutProduct[];
  title?: string;
  className?: string;
}

export function AssetDonutChart({
  data,
  title = "ASSET DISTRIBUTION",
  className,
}: AssetDonutChartProps) {
  const [hoveredData, setHoveredData] = useState<{ name: string; value: number } | null>(null);

  const chartData = data
    .map((p) => ({
      name: p.name,
      value: p.price * p.stock,
    }))
    .filter((d) => d.value > 0);

  const totalValue = chartData.reduce((acc, d) => acc + d.value, 0);
  const chartDataWithPct = chartData.map((d) => ({
    ...d,
    percentage: totalValue > 0 ? (d.value / totalValue) * 100 : 0,
  }));
  const sortedByValue = [...chartDataWithPct].sort((a, b) => b.value - a.value);
  const legendItems = sortedByValue;

  const isEmpty = chartData.length === 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border-2 border-ink bg-white p-4 md:p-6 dark:border-white/10 dark:bg-surface-dark",
        className
      )}
    >
      {title && (
        <p className="mb-3 shrink-0 text-sm font-bold uppercase tracking-widest text-ink dark:text-white">
          {title}
        </p>
      )}

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-sm text-gray-500 dark:text-gray-400">No asset data</p>
        </div>
      ) : (
        <>
          {/* Chart area with center text */}
          <div className="relative h-[250px] min-h-[250px] w-full shrink-0">
            <div
              className="h-full w-full"
              onMouseLeave={() => setHoveredData(null)}
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={1}
                    stroke="transparent"
                    onMouseEnter={(_, index) => setHoveredData(chartData[index])}
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={NERV_COLORS[index % NERV_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-[140px] -translate-x-1/2 -translate-y-1/2 px-2 text-center"
              aria-hidden
            >
              <p className="truncate font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {hoveredData ? hoveredData.name : "TOTAL ASET"}
              </p>
              <p className="mt-1 truncate font-mono text-base font-bold tabular-nums text-ink drop-shadow-[0_0_6px_rgba(242,13,13,0.5)] sm:text-lg dark:text-white">
                {hoveredData ? formatRupiahShort(hoveredData.value) : formatRupiahShort(totalValue)}
              </p>
            </div>
          </div>

          {/* Custom legend — scrollable agar semua produk muat */}
          <div className="mt-3 flex-1 min-h-0 max-h-48 overflow-y-auto border-t border-gray-200 pt-3 pr-2 dark:border-white/10">
            <div className="flex flex-col gap-2">
              {legendItems.map((item, index) => (
                <div
                  key={`legend-${index}`}
                  className="flex items-center gap-2 font-mono text-sm font-medium"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-gray-200 dark:border-white/10"
                    style={{ backgroundColor: NERV_COLORS[index % NERV_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-gray-500 dark:text-gray-400">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
