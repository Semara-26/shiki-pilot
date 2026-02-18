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

type CursorShape = { x?: number; y?: number; width?: number; height?: number };
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

const CHART_COLOR = "#f20d0d";
const CURSOR_GRADIENT_ID = "holo-scanner-cursor-gradient";

function CustomCursor({ x, y, width, height }: CursorShape) {
  if (width == null || height == null || x == null || y == null) return null;
  return (
    <g>
      <defs>
        <linearGradient
          id={CURSOR_GRADIENT_ID}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.35} />
          <stop offset="50%" stopColor={CHART_COLOR} stopOpacity={0.12} />
          <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${CURSOR_GRADIENT_ID})`}
        className="pointer-events-none"
      />
    </g>
  );
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const fullName = item.name ?? payload[0].payload?.name;
  const stock = item.value ?? payload[0].value;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-md border border-primary/60 bg-card/80 px-3 py-2 shadow-lg backdrop-blur-md"
      style={{ borderColor: "rgba(242, 13, 13, 0.5)" }}
    >
      <p className="mb-1 font-mono text-xs text-muted-foreground">{fullName}</p>
      <p className="font-mono text-xl font-semibold text-foreground tabular-nums">
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

export function GrowthChart({ data, title, className }: GrowthChartProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-4 text-card-foreground",
        className
      )}
    >
      {title && (
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      )}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) =>
                typeof value === "string" && value.length > 10
                  ? value.substring(0, 10) + "…"
                  : String(value)
              }
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={<CustomCursor />}
            />
            <Bar
              dataKey="value"
              fill={CHART_COLOR}
              radius={[0, 0, 0, 0]}
              name="Stock"
              animationDuration={1500}
              activeBar={{
                stroke: CHART_COLOR,
                strokeWidth: 2,
                fillOpacity: 1,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
