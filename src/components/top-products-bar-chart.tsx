"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

export interface TopProductsDataPoint {
  name: string;
  value: number;
}

interface TopProductsBarChartProps {
  data: TopProductsDataPoint[];
  title?: string;
  className?: string;
}

const BAR_COLOR_LIGHT = "#ef4444";
const BAR_COLOR_DARK = "#22d3ee";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: { name?: string; value?: number }; value?: number }>;
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload ?? payload[0];
  const name = (item as { name?: string })?.name ?? "";
  const value = (item as { value?: number })?.value ?? (payload[0].value as number) ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="rounded-md border border-ink/30 bg-white p-3 shadow-lg dark:border-white/20 dark:bg-[#0a0a0a]"
    >
      <p className="mb-1 font-mono text-xs text-ink dark:text-gray-300">{name}</p>
      <p className="font-mono text-base font-semibold tabular-nums text-ink dark:text-gray-100">
        {value} <span className="text-sm font-normal text-muted-foreground">unit</span>
      </p>
    </motion.div>
  );
}

const GRID_LIGHT = "#e5e7eb";
const GRID_DARK = "rgba(255,255,255,0.1)";
const TICK_LIGHT = "#374151";
const TICK_DARK = "#9ca3af";

export function TopProductsBarChart({ data, title, className }: TopProductsBarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const barColor = isDark ? BAR_COLOR_DARK : BAR_COLOR_LIGHT;

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
      <div className="mt-4 w-full min-h-[300px] h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 42, left: 10, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? GRID_DARK : GRID_LIGHT}
              strokeOpacity={0.5}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: isDark ? TICK_DARK : TICK_LIGHT, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: isDark ? GRID_DARK : GRID_LIGHT }}
              tickFormatter={(v) => String(Math.round(Number(v)))}
            />
            <YAxis
              type="category"
              dataKey="name"
              interval={0}
              angle={-45}
              textAnchor="end"
              tick={{ fill: isDark ? TICK_DARK : TICK_LIGHT, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: isDark ? GRID_DARK : GRID_LIGHT }}
              width={120}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar
              dataKey="value"
              fill={barColor}
              radius={[0, 4, 4, 0]}
              name="Qty"
              animationDuration={1000}
            >
              <LabelList
                dataKey="value"
                position="right"
                fill="#888888"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
