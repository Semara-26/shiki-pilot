"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useState, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Receipt, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransactionItemRow {
  productName: string | null;
  quantity: number;
  subtotal: number;
}

export interface TransactionRow {
  id: string;
  receiptId: string;
  totalPrice: number;
  type: string;
  paymentType: string;
  createdAt: Date;
  items: TransactionItemRow[];
}

interface TransactionsTableProps {
  transactions: TransactionRow[];
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Receipt Modal — komponen terpisah + memo ─────────────────────────────────

interface ReceiptModalProps {
  tx: TransactionRow;
  onClose: () => void;
}

const ReceiptModal = memo(function ReceiptModal({
  tx,
  onClose,
}: ReceiptModalProps) {
  const modalContent = (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-detail-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ willChange: "opacity" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.7 }}
        style={{ willChange: "transform, opacity" }}
        className="w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-md border border-primary/50 bg-secondary/90 p-6 shadow-[0_0_30px_rgba(14,165,233,0.3)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 shrink-0 text-primary" />
            <h2
              id="transaction-detail-title"
              className="font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              Struk Digital&nbsp;
              <span className="text-foreground">
                {tx.receiptId}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1.5 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 border-t border-dashed border-primary/30 flex-shrink-0" />

        {/* Timestamp */}
        <div className="mb-5 flex items-center justify-between gap-2 flex-shrink-0">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Waktu Transaksi
          </span>
          <span className="font-mono text-xs tabular-nums text-foreground">
            {formatDateTime(tx.createdAt)}
          </span>
        </div>

        {/* Product table */}
        <div className="mb-5 flex-1 min-h-0 flex flex-col">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Detail Pembelian
          </p>
          <div className="rounded border border-white/10 bg-black/20 flex flex-col overflow-hidden">
            <div className="grid grid-cols-[1fr_3rem_auto] gap-x-3 border-b border-white/10 bg-black/20 px-4 py-2 flex-shrink-0">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Produk
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground text-right">
                Qty
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground text-right">
                Harga
              </span>
            </div>
            <div className="overflow-y-auto px-4 py-2 space-y-2 max-h-[40vh] custom-scrollbar">
              {tx.items.map((item, index) => {
                const unitPrice = item.quantity > 0 ? Math.round(item.subtotal / item.quantity) : 0;
                return (
                  <div key={index} className="grid grid-cols-[1fr_3rem_auto] gap-x-3 py-1">
                    <div className="flex flex-col truncate">
                      <span className="font-mono text-sm text-foreground truncate">
                        {item.productName ?? (
                          <span className="italic text-muted-foreground">
                            Produk Dihapus
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate">
                        {formatRupiah(unitPrice)}/pcs
                      </span>
                    </div>
                    <span className="font-mono text-sm tabular-nums text-foreground text-right pt-0.5">
                      {item.quantity}x
                    </span>
                    <span className="font-mono text-sm tabular-nums text-foreground text-right pt-0.5">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-4 border-t border-dashed border-primary/30 flex-shrink-0" />

        {/* Metode Pembayaran */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Metode Pembayaran
          </span>
          {tx.paymentType === "qris_statis" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-cyan-400">
              📱 QRIS Statis
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-500/40 bg-gray-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-gray-400">
              💵 TUNAI
            </span>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            Total Pembayaran
          </span>
          <span className="font-mono text-2xl font-bold tabular-nums text-primary">
            {formatRupiah(tx.totalPrice)}
          </span>
        </div>

        {/* Footer stamp */}
        <div className="mt-6 flex justify-center flex-shrink-0">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground/40">
            — ShikiPilot —
          </span>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
});

// ─── TransactionTableRow — state modal TERISOLASI di sini ─────────────────────

interface TxRowProps {
  tx: TransactionRow;
}

const TransactionTableRow = memo(function TransactionTableRow({
  tx,
}: TxRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const totalQuantity = tx.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.14 }}
        style={{ willChange: "transform, opacity" }}
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        className="cursor-pointer border-b border-gray-200 transition-colors duration-150 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-primary/10"
      >
        <td className="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
          {formatDateTime(tx.createdAt)}
        </td>
        <td className="px-4 py-4 font-semibold text-ink dark:text-white">
          {tx.receiptId}
        </td>
        <td className="px-4 py-4 font-semibold text-ink dark:text-white">
          {tx.items.length === 1 && tx.items[0].productName 
            ? tx.items[0].productName 
            : `${tx.items.length} Jenis Produk`}
        </td>
        <td className="px-4 py-4 text-right tabular-nums font-semibold text-ink dark:text-white">
          {totalQuantity} Item
        </td>
        <td className="px-4 py-4">
          {tx.paymentType === "qris_statis" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-cyan-400">
              📱 QRIS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-500/40 bg-gray-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-gray-400">
              💵 TUNAI
            </span>
          )}
        </td>
        <td className="px-4 py-4 text-right tabular-nums font-semibold text-primary">
          {formatRupiah(tx.totalPrice)}
        </td>
      </motion.tr>

      {/* Modal hanya di-mount saat isOpen === true */}
      <AnimatePresence>
        {isOpen && <ReceiptModal tx={tx} onClose={close} />}
      </AnimatePresence>
    </>
  );
});

// ─── TransactionsTable ────────────────────────────────────────────────────────

export function TransactionsTable({
  transactions,
  className,
}: TransactionsTableProps) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border-2 border-ink bg-white dark:border-white/10 dark:bg-surface-dark",
        className,
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
                Ringkasan Item
              </th>
              <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                Jumlah Item
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                Metode
              </th>
              <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                Total Pembayaran
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  Belum ada transaksi yang tercatat.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <TransactionTableRow key={tx.id} tx={tx} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
