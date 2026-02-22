"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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
}

export function ProductsTable({ products, className }: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "rounded-md border border-border bg-card text-card-foreground overflow-hidden",
          className
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="crisp-table border-b border-border/60 bg-muted/30">
                <th className="px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                  Product Name
                </th>
                <th className="w-[120px] px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                  Status
                </th>
                <th className="w-[72px] px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                  Resource
                </th>
                <th className="px-4 py-4 text-right font-medium uppercase tracking-widest text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-4 text-right font-medium uppercase tracking-widest text-muted-foreground">
                  Stock
                </th>
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
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
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
                    className="group crisp-table cursor-pointer border-l-2 border-l-transparent transition-all duration-500 ease-in-out hover:border-l-primary hover:bg-gradient-to-r hover:from-primary/20 hover:via-primary/5 hover:to-transparent"
                  >
                    <td className="px-4 py-4 font-medium text-foreground transition-colors duration-300 group-hover:text-white">
                      #{product.id.substring(0, 4)}
                    </td>
                    <td className="px-4 py-4 text-foreground transition-colors duration-300 group-hover:text-white">
                      {product.name}
                    </td>
                    <td className="w-[120px] px-4 py-4 align-middle transition-colors duration-300 group-hover:text-white">
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
                    <td className="w-[72px] px-4 py-4 align-middle transition-colors duration-300 group-hover:text-white">
                      {product.imageUrl ? (
                        <div className="relative inline-block h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground avatar-mono">
                          {getInitials(product.name)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-foreground transition-colors duration-300 group-hover:text-white">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-foreground transition-colors duration-300 group-hover:text-white">
                      {product.stock}
                    </td>
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
