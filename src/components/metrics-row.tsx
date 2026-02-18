"use client";

import { cn } from "@/src/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

interface MetricsRowProps {
  metrics: MetricCard[];
  className?: string;
}

export function MetricsRow({ metrics, className }: MetricsRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-md border border-border bg-card p-4 text-card-foreground transition-colors hover:border-border/80"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {metric.label}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {metric.value}
          </p>
          {metric.change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5 font-mono text-sm">
              {metric.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-chart-2" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={cn(
                  metric.change >= 0 ? "text-chart-2" : "text-destructive"
                )}
              >
                {metric.change >= 0 ? "+" : ""}
                {metric.change}%
              </span>
              {metric.changeLabel && (
                <span className="text-muted-foreground">
                  {metric.changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
