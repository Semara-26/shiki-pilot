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

// --- Custom XAxis tick: teks nama produk dibungkus ke baris baru (multiline) ---
// Mencegah label saling tumpang-tindih saat nama produk panjang
const MAX_CHARS_PER_LINE = 10;
const TICK_LINE_HEIGHT = 12;

function MultilineXTick({
  x,
  y,
  payload,
  fill,
}: {
  // recharts bisa memberikan x/y sebagai string atau number — terima keduanya
  x?: string | number;
  y?: string | number;
  payload?: { value?: string };
  fill?: string;
}) {
  // Normalkan ke number untuk dipakai di transform SVG
  const nx = Number(x ?? 0);
  const ny = Number(y ?? 0);
  const name = payload?.value ?? "";
  const words = name.split(" ");

  // Bangun baris berdasarkan batas karakter per baris
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > MAX_CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return (
    <g transform={`translate(${nx},${ny})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * TICK_LINE_HEIGHT}
          dy={6}
          textAnchor="middle"
          fill={fill ?? "#9ca3af"}
          fontSize={10}
        >
          {line}
        </text>
      ))}
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
      <p className="mb-1 font-mono text-xs text-ink dark:text-gray-300">
        {name}
      </p>
      <p className="font-mono text-base font-semibold tabular-nums text-ink dark:text-gray-100">
        {value}{" "}
        <span className="text-sm font-normal text-muted-foreground">unit</span>
      </p>
    </motion.div>
  );
}

const GRID_LIGHT = "#e5e7eb";
const GRID_DARK = "rgba(255,255,255,0.1)";
const TICK_LIGHT = "#374151";
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
      <div className="mt-4 w-full flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {/* Layout vertical (horizontal bars) */}
          <BarChart
            data={data.slice(0, 15)}
            layout="vertical"
            margin={{ top: 10, right: 32, left: 110, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? GRID_DARK : GRID_LIGHT}
              strokeOpacity={0.5}
              horizontal={false}
              vertical={true}
            />
            {/* XAxis = nilai numerik (unit terjual) */}
            <XAxis type="number" hide />
            {/* YAxis = nama produk */}
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              tickMargin={10}
              tick={{ fill: isDark ? TICK_DARK : TICK_LIGHT, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
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
              {/* Label value di kanan bar */}
              <LabelList
                dataKey="value"
                position="right"
                fill="#888888"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
