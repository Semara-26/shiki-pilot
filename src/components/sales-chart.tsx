"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

const STROKE_COLOR_LIGHT = "#ef4444";
const STROKE_COLOR_DARK = "#22d3ee";
const GRADIENT_ID_LIGHT = "colorRevenueLight";
const GRADIENT_ID_DARK = "colorRevenueDark";

export interface SalesChartDataPoint {
  name: string;
  value: number;
}

interface SalesChartProps {
  data: SalesChartDataPoint[];
  title?: string;
  className?: string;
  /** When true, skip outer container styling (for embedding in another chart container) */
  embedded?: boolean;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface SalesTooltipContentProps {
  active?: boolean;
  payload?: Array<{ payload?: { name?: string; value?: number }; value?: number }>;
}

function SalesTooltipContent({ active, payload }: SalesTooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload ?? payload[0];
  const name = (item as { name?: string })?.name ?? "";
  const value = (item as { value?: number })?.value ?? (payload[0].value as number) ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-md border border-ink/30 bg-white p-3 shadow-lg dark:border-white/20 dark:bg-[#0a0a0a]"
    >
      <p className="mb-1 font-mono text-xs text-ink dark:text-gray-300">{name}</p>
      <p className="font-mono text-lg font-semibold tabular-nums text-ink dark:text-gray-100">
        {formatRupiah(Number(value))}
      </p>
    </motion.div>
  );
}

const GRID_STROKE_LIGHT = "#e5e7eb";
const GRID_STROKE_DARK = "rgba(255,255,255,0.1)";
const TICK_FILL_LIGHT = "#374151";
const TICK_FILL_DARK = "#9ca3af";

export function SalesChart({ data, title, className, embedded }: SalesChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridStroke = isDark ? GRID_STROKE_DARK : GRID_STROKE_LIGHT;
  const tickFill = isDark ? TICK_FILL_DARK : TICK_FILL_LIGHT;
  const strokeColor = isDark ? STROKE_COLOR_DARK : STROKE_COLOR_LIGHT;
  const gradientId = isDark ? GRADIENT_ID_DARK : GRADIENT_ID_LIGHT;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden",
        !embedded && "rounded-lg border-2 border-ink bg-white p-4 md:p-6 dark:border-white/20 dark:bg-[#0a0a0a]",
        className
      )}
    >
      {title && (
        <p className="shrink-0 text-sm font-bold uppercase tracking-widest text-ink dark:text-gray-300">
          {title}
        </p>
      )}
      <div className="mt-4 w-full min-h-[300px] h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridStroke}
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={(v) =>
                typeof v === "string" && v.length > 12
                  ? v.substring(0, 12) + "…"
                  : String(v)
              }
            />
            <YAxis
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const num = Number(v);
                if (num >= 1000000) return `${(num / 1000000).toFixed(0)}jt`;
                if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
                return String(v);
              }}
            />
            <Tooltip content={<SalesTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 8 }}
              name="Revenue"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
