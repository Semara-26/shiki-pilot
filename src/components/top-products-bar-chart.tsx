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

const MAX_CHARS_PER_LINE = 18;

function wrapLabelText(text: string): string[] {
  if (!text || text.length <= MAX_CHARS_PER_LINE) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (current.length + w.length + 1 <= MAX_CHARS_PER_LINE) {
      current += (current ? " " : "") + w;
    } else {
      if (current) lines.push(current);
      current =
        w.length > MAX_CHARS_PER_LINE ? w.slice(0, MAX_CHARS_PER_LINE) : w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface WrappedYAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value?: string; name?: string };
  fill?: string;
  fontSize?: number;
}

function WrappedYAxisTick({
  x = 0,
  y = 0,
  payload,
  fill,
  fontSize = 13,
}: WrappedYAxisTickProps) {
  const text = payload?.value ?? payload?.name ?? "";
  const lines = wrapLabelText(text);
  const lineHeight = fontSize + 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        textAnchor="end"
        fill={fill}
        fontSize={fontSize}
        fontFamily="monospace"
        style={{ fontWeight: 500 }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export interface TopProductsDataPoint {
  name: string;
  value: number;
}

interface TopProductsBarChartProps {
  data: TopProductsDataPoint[];
  title?: string;
  className?: string;
}

const BAR_COLOR_LIGHT = "hsl(var(--primary))";
const BAR_COLOR_DARK = "hsl(var(--primary))";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: { name?: string; value?: number };
    value?: number;
  }>;
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload ?? payload[0];
  const name = (item as { name?: string })?.name ?? "";
  const value =
    (item as { value?: number })?.value ?? (payload[0].value as number) ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="rounded-md border border-ink/30 bg-white p-3 shadow-lg dark:border-white/20 dark:bg-[#0a0a0a]"
    >
      <p className="mb-1 font-mono text-sm text-ink dark:text-gray-300">
        {name}
      </p>
      <p className="font-mono text-sm font-semibold tabular-nums text-ink dark:text-gray-100">
        {value}{" "}
        <span className="text-sm font-normal text-muted-foreground">unit</span>
      </p>
    </motion.div>
  );
}

const GRID_LIGHT = "#e5e7eb";
const GRID_DARK = "rgba(255,255,255,0.1)";
const TICK_LIGHT = "#6b7280";
const TICK_DARK = "#9ca3af";

export function TopProductsBarChart({
  data,
  title,
  className,
}: TopProductsBarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const barColor = isDark ? BAR_COLOR_DARK : BAR_COLOR_LIGHT;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border-2 border-ink bg-white p-4 md:p-6 dark:border-white/20 dark:bg-[#0a0a0a]",
        className,
      )}
    >
      {title && (
        <p className="shrink-0 text-sm font-bold uppercase tracking-widest text-ink dark:text-gray-300">
          {title}
        </p>
      )}
      <div className="relative mt-4 max-h-[400px] w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div
          style={{ height: `${Math.max(data.slice(0, 15).length * 44, 280)}px` }}
          className="w-full"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            {/* Layout vertical (horizontal bars) */}
            <BarChart
              data={data.slice(0, 15)}
              layout="vertical"
              margin={{ top: 10, right: 50, left: 8, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? GRID_DARK : GRID_LIGHT}
                strokeOpacity={0.5}
                horizontal={false}
              />
              {/* XAxis = nilai numerik (unit terjual) */}
              <XAxis 
                type="number" 
                tick={{ fill: isDark ? TICK_DARK : TICK_LIGHT, fontSize: 13 }}
                tickLine={false}
                axisLine={{ stroke: isDark ? GRID_DARK : GRID_LIGHT }}
                tickFormatter={(v) => String(Math.round(Number(v)))}
              />
              {/* YAxis = nama produk */}
              <YAxis
                dataKey="name"
                type="category"
                interval={0}
                width={140}
                tickLine={false}
                axisLine={false}
                tick={<WrappedYAxisTick fill={isDark ? TICK_DARK : TICK_LIGHT} fontSize={13} />}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="value"
                fill={barColor}
                radius={[0, 4, 4, 0]}
                name="Qty"
                barSize={24}
                animationDuration={1000}
              >
                {/* Label value di samping bar */}
                <LabelList
                  dataKey="value"
                  position="right"
                  fill={isDark ? "#d1d5db" : "#374151"}
                  fontSize={13}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
