"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/src/lib/utils";

const CHART_COLOR = "#f20d0d";

export interface GrowthChartDataPoint {
  name: string;
  value: number;
  fullLabel?: string;
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
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 0,
              }}
              labelStyle={{ color: "hsl(var(--card-foreground))" }}
              itemStyle={{ color: CHART_COLOR }}
              formatter={(value: number) => [value, "Stock"]}
              labelFormatter={(_, payload) =>
                payload[0]?.payload?.fullLabel ?? payload[0]?.payload?.name
              }
            />
            <Bar
              dataKey="value"
              fill={CHART_COLOR}
              radius={[0, 0, 0, 0]}
              name="Stock"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
