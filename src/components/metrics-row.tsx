"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

export interface MetricProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface MetricsRowProps {
  totalValue: string;
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  products?: MetricProduct[];
  className?: string;
}

const cards: {
  key: "totalValue" | "totalProducts" | "totalStock" | "lowStock";
  label: string;
  drawerKey: "VALUE" | "TYPES" | "ITEMS" | "LOW_STOCK";
}[] = [
  { key: "totalValue", label: "ESTIMATED ASSET VALUE", drawerKey: "VALUE" },
  { key: "totalProducts", label: "PRODUCT TYPES", drawerKey: "TYPES" },
  { key: "totalStock", label: "TOTAL ITEMS", drawerKey: "ITEMS" },
  { key: "lowStock", label: "LOW STOCK ALERT", drawerKey: "LOW_STOCK" },
];

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function MetricsRow({
  totalValue,
  totalProducts,
  totalStock,
  lowStock,
  products = [],
  className,
}: MetricsRowProps) {
  const [activeDrawer, setActiveDrawer] = useState<
    "VALUE" | "TYPES" | "ITEMS" | "LOW_STOCK" | null
  >(null);

  const values = { totalValue, totalProducts, totalStock, lowStock };

  const lowStockProducts = products.filter((p) => p.stock < 10);

  const totalAssetValue = products.reduce(
    (acc, p) => acc + p.price * p.stock,
    0
  );
  const sortedProducts = [...products].sort(
    (a, b) => b.price * b.stock - a.price * a.stock
  );

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {cards.map(({ key, label, drawerKey }) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => setActiveDrawer(drawerKey)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveDrawer(drawerKey);
              }
            }}
            className="cursor-pointer rounded-md border border-border bg-card p-4 text-card-foreground transition-all duration-700 ease-out hover:border-primary/80 hover:bg-primary/[0.03] hover:shadow-[inset_0_0_20px_rgba(242,13,13,0.1),0_0_20px_rgba(242,13,13,0.3)]"
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

      <AnimatePresence>
        {activeDrawer != null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => setActiveDrawer(null)}
              aria-hidden
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-primary/50 bg-secondary/95 shadow-[-10px_0_30px_rgba(242,13,13,0.2)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
            >
              <div className="shrink-0 border-b border-border/60 px-6 py-4 flex items-center justify-between">
                <h2
                  id="drawer-title"
                  className="font-mono text-sm font-medium uppercase tracking-widest text-foreground"
                >
                  {activeDrawer === "VALUE" && "ESTIMATED ASSET VALUE // BREAKDOWN"}
                  {activeDrawer === "TYPES" && "PRODUCT TYPES // REGISTER"}
                  {activeDrawer === "ITEMS" && "TOTAL ITEMS // STOCK LOG"}
                  {activeDrawer === "LOW_STOCK" && "LOW STOCK ALERT // REPORT"}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="rounded p-1.5 font-mono text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Close"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden font-mono text-sm">
                {activeDrawer === "VALUE" && (
                  <>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 p-6">
                      {products.length === 0 ? (
                        <p className="text-muted-foreground">No assets on record.</p>
                      ) : (
                        sortedProducts.map((p) => {
                          const subtotal = p.price * p.stock;
                          const percentage =
                            totalAssetValue > 0
                              ? (subtotal / totalAssetValue) * 100
                              : 0;
                          return (
                            <div
                              key={p.id}
                              className="relative overflow-hidden rounded-md border border-border/50 bg-background/50 p-3"
                            >
                              <div
                                className="absolute top-0 left-0 h-full bg-primary/10"
                                style={{ width: `${percentage}%` }}
                                aria-hidden
                              />
                              <div className="relative z-10 grid grid-cols-12 gap-2 items-center text-sm font-mono">
                                <div className="col-span-5 truncate text-foreground">
                                  {p.name}
                                </div>
                                <div className="col-span-4 text-xs text-muted-foreground">
                                  {p.stock} × {formatRupiah(p.price)}
                                </div>
                                <div className="col-span-3 text-right text-primary">
                                  {formatRupiah(subtotal)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {products.length > 0 && (
                      <div className="shrink-0 mt-4 pt-4 border-t border-primary/50 flex justify-between items-center px-6 pb-6">
                        <span className="font-mono text-muted-foreground uppercase tracking-wider text-sm">
                          TOTAL ESTIMATED ASSET
                        </span>
                        <span className="font-mono text-lg font-bold text-primary drop-shadow-[0_0_8px_rgba(242,13,13,0.6)]">
                          {formatRupiah(totalAssetValue)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {activeDrawer === "LOW_STOCK" && (
                  <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-2">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-emerald-500/90 font-medium">
                        ALL SYSTEMS NOMINAL. No low stock detected.
                      </p>
                    ) : (
                      lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between gap-4 border-b border-border/40 py-2 text-foreground"
                        >
                          <span className="text-muted-foreground truncate">{p.name}</span>
                          <span className="tabular-nums text-destructive shrink-0">
                            {p.stock} units
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  </div>
                )}

                {(activeDrawer === "TYPES" || activeDrawer === "ITEMS") && (
                  <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-2">
                    {products.length === 0 ? (
                      <p className="text-muted-foreground">No products on record.</p>
                    ) : (
                      products.map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between gap-4 border-b border-border/40 py-2 text-foreground"
                        >
                          <span className="text-muted-foreground truncate">{p.name}</span>
                          <span className="tabular-nums shrink-0">{p.stock} stok</span>
                        </div>
                      ))
                    )}
                  </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
