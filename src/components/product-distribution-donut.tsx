"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

const NERV_COLORS = ["#22d3ee", "#ef4444", "#f97316", "#eab308", "#a855f7", "#ec4899"];

export interface DistributionDataPoint {
  name: string;
  value: number;
}

interface ProductDistributionDonutProps {
  data: DistributionDataPoint[];
  title?: string;
  className?: string;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { percentage?: number } }>;
}

function DonutTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = item.name ?? "";
  const value = (item.value as number) ?? 0;
  const pct = (item.payload as { percentage?: number })?.percentage;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="rounded-md border border-ink/30 bg-white p-3 shadow-lg dark:border-white/20 dark:bg-[#0a0a0a]"
    >
      <p className="mb-1 font-mono text-xs text-ink dark:text-gray-300">{name}</p>
      <p className="font-mono text-base font-semibold tabular-nums text-ink dark:text-gray-100">
        {formatRupiah(value)}
      </p>
      {pct != null && (
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{pct.toFixed(1)}%</p>
      )}
    </motion.div>
  );
}

export function ProductDistributionDonut({
  data,
  title = "KONTRIBUSI PENDAPATAN",
  className,
}: ProductDistributionDonutProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const labelColor = isDark ? "#e5e7eb" : "#374151";
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const totalDisplay =
    total >= 1e6 ? `Rp ${(total / 1e6).toFixed(1)}jt` : formatRupiah(total);
  const chartData = data
    .map((d) => ({
      ...d,
      percentage: total > 0 ? (d.value / total) * 100 : 0,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const isEmpty = chartData.length === 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border-2 border-ink bg-white p-4 md:p-6 dark:border-white/20 dark:bg-[#0a0a0a]",
        className
      )}
    >
      {title && (
        <p className="shrink-0 text-sm font-bold uppercase tracking-widest text-ink dark:text-gray-300">
          {title}
        </p>
      )}
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-sm text-muted-foreground">No revenue data</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="w-full min-h-[320px] h-[320px] shrink-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="transparent"
                  label={(props) => {
                    const { x, y, textAnchor, percent, cx, cy, index } = props as {
                      x?: number;
                      y?: number;
                      textAnchor?: string;
                      percent?: number;
                      cx?: number;
                      cy?: number;
                      index?: number;
                    };
                    const showPct = (percent ?? 0) >= 0.03;
                    const centerLabel =
                      index === 0 ? (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{ fontFamily: "monospace" }}
                        >
                          <tspan
                            x={cx}
                            dy="-0.5em"
                            fill={isDark ? "#9ca3af" : "#6b7280"}
                            fontSize={14}
                          >
                            TOTAL
                          </tspan>
                          <tspan
                            x={cx}
                            dy="1.6em"
                            fill={isDark ? "#ffffff" : "#111827"}
                            fontSize={18}
                            fontWeight="bold"
                          >
                            {totalDisplay}
                          </tspan>
                        </text>
                      ) : null;
                    return (
                      <>
                        {centerLabel}
                        {showPct && (
                          <text
                            x={x}
                            y={y}
                            textAnchor={(textAnchor as "start" | "middle" | "end") ?? "middle"}
                            fill={labelColor}
                            fontSize={11}
                          >
                            {((percent ?? 0) * 100).toFixed(0)}%
                          </text>
                        )}
                      </>
                    );
                  }}
                  labelLine={{ stroke: labelColor, strokeWidth: 1 }}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={NERV_COLORS[i % NERV_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend: vertikal agar nama produk tidak terpotong */}
          <div
            className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-white/10"
            role="list"
            aria-label="Keterangan produk"
          >
            {chartData.map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className="flex items-center gap-2 font-mono text-xs"
                role="listitem"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-gray-300 dark:border-white/20"
                  style={{ backgroundColor: NERV_COLORS[i % NERV_COLORS.length] }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 text-ink dark:text-gray-200 break-words">
                  {item.name}
                </span>
                <span className="shrink-0 tabular-nums text-gray-600 dark:text-gray-400">
                  {(item.percentage ?? 0).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
