"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
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
  title = "REVENUE DISTRIBUTION",
  className,
}: ProductDistributionDonutProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
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
        "flex h-full flex-col overflow-hidden rounded-lg border-2 border-ink bg-white p-6 dark:border-white/20 dark:bg-[#0a0a0a]",
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
        <div className="relative mt-4 flex flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={2}
                stroke="transparent"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={NERV_COLORS[i % NERV_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" aria-hidden>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              TOTAL
            </p>
            <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-ink dark:text-white">
              {total >= 1e6 ? `Rp ${(total / 1e6).toFixed(1)}jt` : formatRupiah(total)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
