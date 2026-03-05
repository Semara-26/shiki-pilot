"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { Receipt, X } from "lucide-react";

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

export interface TransactionRow {
  id: string;
  quantity: number;
  totalPrice: number;
  type: string;
  createdAt: Date;
  productId: string;
  productName: string | null;
  productPrice: number | null;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

interface TransactionsTableProps {
  transactions: TransactionRow[];
  className?: string;
}

export function TransactionsTable({ transactions, className }: TransactionsTableProps) {
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const unitPrice = selectedTx
    ? selectedTx.productPrice ??
      (selectedTx.quantity > 0
        ? Math.round(selectedTx.totalPrice / selectedTx.quantity)
        : 0)
    : 0;

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
                  Tanggal &amp; Waktu
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  ID Transaksi
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Nama Produk
                </th>
                <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Jumlah Item
                </th>
                <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Total Pembayaran
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={tableContainerVariants}
              initial="initial"
              animate="animate"
            >
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    Belum ada transaksi yang tercatat.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    variants={tableRowVariants}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedTx(tx);
                      setIsOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedTx(tx);
                        setIsOpen(true);
                      }
                    }}
                    className="cursor-pointer border-b border-gray-200 transition-all duration-200 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-primary/10"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-ink dark:text-white">
                      #{tx.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 font-semibold text-ink dark:text-white">
                      {tx.productName ?? (
                        <span className="italic text-gray-400 dark:text-gray-500">
                          Produk Dihapus
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-ink dark:text-white">
                      {tx.quantity}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-primary">
                      {formatRupiah(tx.totalPrice)}
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail — Struk Digital */}
      <AnimatePresence>
        {isOpen && selectedTx && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-title"
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
              className="w-full max-w-md overflow-hidden rounded-md border border-primary/50 bg-secondary/90 p-6 shadow-[0_0_30px_rgba(242,13,13,0.3)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 shrink-0 text-primary" />
                  <h2
                    id="transaction-detail-title"
                    className="font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    Struk Digital&nbsp;
                    <span className="text-foreground">
                      #{selectedTx.id.substring(0, 8).toUpperCase()}
                    </span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 rounded p-1.5 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Dashed divider */}
              <div className="mb-5 border-t border-dashed border-primary/30" />

              {/* Timestamp */}
              <div className="mb-5 flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Waktu Transaksi
                </span>
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {formatDateTime(selectedTx.createdAt)}
                </span>
              </div>

              {/* Product table */}
              <div className="mb-5">
                <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Detail Pembelian
                </p>
                <div className="rounded border border-white/10 bg-black/20 overflow-hidden">
                  <div className="grid grid-cols-[1fr_3rem_auto] gap-x-3 border-b border-white/10 bg-black/20 px-4 py-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Produk
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground text-right">
                      Qty
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground text-right">
                      Harga Satuan
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_3rem_auto] gap-x-3 px-4 py-3">
                    <span className="font-mono text-sm text-foreground truncate">
                      {selectedTx.productName ?? (
                        <span className="italic text-muted-foreground">
                          Produk Dihapus
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-sm tabular-nums text-foreground text-right">
                      {selectedTx.quantity}x
                    </span>
                    <span className="font-mono text-sm tabular-nums text-foreground text-right">
                      {formatRupiah(unitPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dashed divider */}
              <div className="mb-4 border-t border-dashed border-primary/30" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                  Total Pembayaran
                </span>
                <span className="font-mono text-2xl font-bold tabular-nums text-primary">
                  {formatRupiah(selectedTx.totalPrice)}
                </span>
              </div>

              {/* Footer stamp */}
              <div className="mt-6 flex justify-center">
                <span className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground/40">
                  — ShikiPilot —
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
