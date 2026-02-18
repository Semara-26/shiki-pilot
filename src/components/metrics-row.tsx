"use client";

import { cn } from "@/src/lib/utils";

interface MetricsRowProps {
  totalValue: string;
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  className?: string;
}

const cards: { key: keyof Omit<MetricsRowProps, "className">; label: string }[] = [
  { key: "totalValue", label: "ESTIMATED ASSET VALUE" },
  { key: "totalProducts", label: "PRODUCT TYPES" },
  { key: "totalStock", label: "TOTAL ITEMS" },
  { key: "lowStock", label: "LOW STOCK ALERT" },
];

export function MetricsRow({
  totalValue,
  totalProducts,
  totalStock,
  lowStock,
  className,
}: MetricsRowProps) {
  const values = { totalValue, totalProducts, totalStock, lowStock };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {cards.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-md border border-border bg-card p-4 text-card-foreground transition-all duration-300 hover:scale-[1.01] hover:border-primary/50 hover:shadow-[0_0_20px_rgba(242,13,13,0.15)]"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {values[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
