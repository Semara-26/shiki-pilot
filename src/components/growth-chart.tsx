"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

const CHART_COLOR = "#f20d0d";

type CursorShape = { x?: number; y?: number; width?: number; height?: number };

/** Targeting Laser cursor: subtle highlight + vertical dashed line at bar center */
function CustomCursor({ x, y, width, height }: CursorShape) {
  if (width == null || height == null || x == null || y == null) return null;
  const centerX = x + width / 2;
  return (
    <g className="pointer-events-none">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(242, 13, 13, 0.05)"
      />
      <line
        x1={centerX}
        y1={y}
        x2={centerX}
        y2={y + height}
        stroke={CHART_COLOR}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
    </g>
  );
}

function HoloTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const fullName = item.name ?? payload[0].payload?.name;
  const stock = item.value ?? payload[0].value;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-md border border-primary/50 bg-background/90 p-3 shadow-[0_0_20px_rgba(242,13,13,0.3)] backdrop-blur-md"
    >
      <p className="mb-1 font-mono text-xs text-muted-foreground">{fullName}</p>
      <p className="font-mono text-xl font-semibold tabular-nums text-foreground drop-shadow-[0_0_8px_rgba(242,13,13,0.8)]">
        {stock}{" "}
        <span className="text-sm font-normal text-muted-foreground">stok</span>
      </p>
    </motion.div>
  );
}

export interface GrowthChartDataPoint {
  name: string;
  value: number;
}

interface GrowthChartProps {
  data: GrowthChartDataPoint[];
  title?: string;
  className?: string;
}

const GRID_STROKE_LIGHT = "#e5e7eb";
const GRID_STROKE_DARK = "rgba(255,255,255,0.1)";
const TICK_FILL_LIGHT = "#6b7280";
const TICK_FILL_DARK = "#9ca3af";

export function GrowthChart({ data, title, className }: GrowthChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridStroke = isDark ? GRID_STROKE_DARK : GRID_STROKE_LIGHT;
  const tickFill = isDark ? TICK_FILL_DARK : TICK_FILL_LIGHT;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border-2 border-ink bg-white p-4 dark:border-white/10 dark:bg-surface-dark",
        className
      )}
    >
      {title && (
        <p className="shrink-0 text-sm font-bold uppercase tracking-widest text-ink dark:text-white">
          {title}
        </p>
      )}
      <div className="flex-1 w-full h-full min-h-0 relative mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 15 }}
          >
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
              tickFormatter={(value) =>
                typeof value === "string" && value.length > 10
                  ? value.substring(0, 10) + "…"
                  : String(value)
              }
            />
            <YAxis
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip
              content={<HoloTooltip />}
              cursor={<CustomCursor />}
            />
            <Bar
              dataKey="value"
              fill={CHART_COLOR}
              radius={[0, 0, 0, 0]}
              name="Stock"
              animationDuration={1500}
              activeBar={{
                stroke: "#f20d0d",
                strokeWidth: 1,
                fill: "#f20d0d",
                fillOpacity: 0.8,
                filter: "drop-shadow(0 0 5px rgba(242,13,13,0.5))",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
