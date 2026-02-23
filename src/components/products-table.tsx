"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState } from "react";

const tableContainerVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

const tableRowVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  description?: string | null;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ProductsTableProps {
  products: ProductRow[];
  className?: string;
  /** When true, shows ACTIONS column with Edit/Delete buttons (e.g. for inventory page). */
  showActions?: boolean;
}

export function ProductsTable({ products, className, showActions }: ProductsTableProps) {
  const colCount = showActions ? 7 : 6;
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "rounded-lg overflow-hidden border-2 border-ink bg-white dark:border-white/10 dark:bg-surface-dark",
          className
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-paper uppercase dark:border-white/10 dark:bg-black/40">
                <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  ID
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Product Name
                </th>
                <th className="w-[120px] px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="w-[72px] px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Resource
                </th>
                <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Price
                </th>
                <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Stock
                </th>
                {showActions && (
                  <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                    ACTIONS
                  </th>
                )}
              </tr>
            </thead>
            <motion.tbody
              variants={tableContainerVariants}
              initial="initial"
              animate="animate"
            >
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <motion.tr
                    key={product.id}
                    variants={tableRowVariants}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedProduct(product);
                        setIsOpen(true);
                      }
                    }}
                    className="cursor-pointer border-b border-gray-200 transition-all duration-200 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-primary/10"
                  >
                    <td className="px-4 py-4 font-semibold text-ink dark:text-white">
                      #{product.id.substring(0, 4)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-ink dark:text-white">
                      {product.name}
                    </td>
                    <td className="w-[120px] px-4 py-4 align-middle">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wider",
                          product.stock > 0
                            ? "bg-chart-2/20 text-chart-2"
                            : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {product.stock > 0 ? "ACTIVE" : "OUT_OF_STOCK"}
                      </span>
                    </td>
                    <td className="w-[72px] px-4 py-4 align-middle">
                      {product.imageUrl ? (
                        <div className="relative inline-block h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-paper dark:border-white/10 dark:bg-black/40">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-paper text-xs font-medium text-gray-500 avatar-mono dark:border-white/10 dark:bg-black/40 dark:text-gray-400">
                          {getInitials(product.name)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-ink dark:text-white">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-ink dark:text-white">
                      {product.stock}
                    </td>
                    {showActions && (
                      <td
                        className="px-4 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary dark:hover:bg-white/10 dark:hover:text-primary"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && selectedProduct && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-inspection-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                mass: 0.8,
              }}
              className="w-full max-w-lg overflow-hidden rounded-md border border-primary/50 bg-secondary/90 p-6 shadow-[0_0_30px_rgba(242,13,13,0.3)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <h2
                  id="asset-inspection-title"
                  className="font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground"
                >
                  ASSET INSPECTION // #{selectedProduct.id.substring(0, 8)}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 rounded p-1.5 font-mono text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Close"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>

              {/* Content */}
              <div className="grid gap-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="shrink-0 overflow-hidden rounded border-2 border-primary/60 bg-muted w-32 h-32">
                    {selectedProduct.imageUrl ? (
                      <Image
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-2xl font-medium text-muted-foreground">
                        {getInitials(selectedProduct.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-mono text-xl font-semibold tracking-tight text-foreground">
                      {selectedProduct.name}
                    </h3>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm">
                      <dt className="text-muted-foreground uppercase tracking-wider">
                        Status
                      </dt>
                      <dd>
                        <span
                          className={cn(
                            "inline-block rounded px-2 py-0.5 text-xs font-medium uppercase",
                            selectedProduct.stock > 0
                              ? "bg-chart-2/20 text-chart-2"
                              : "bg-destructive/20 text-destructive"
                          )}
                        >
                          {selectedProduct.stock > 0 ? "ACTIVE" : "OUT_OF_STOCK"}
                        </span>
                      </dd>
                      <dt className="text-muted-foreground uppercase tracking-wider">
                        Price
                      </dt>
                      <dd className="tabular-nums text-foreground">
                        {formatRupiah(selectedProduct.price)}
                      </dd>
                      <dt className="text-muted-foreground uppercase tracking-wider">
                        Stock
                      </dt>
                      <dd className="tabular-nums text-foreground">
                        {selectedProduct.stock}
                      </dd>
                    </dl>
                  </div>
                </div>

                {selectedProduct.description != null &&
                selectedProduct.description !== "" ? (
                  <div className="border-t border-border/60 pt-4">
                    <dt className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                      Description
                    </dt>
                    <p className="font-mono text-sm text-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
