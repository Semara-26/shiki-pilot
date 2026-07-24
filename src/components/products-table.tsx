"use client";

/**
 * ProductsTable — Refactored for Performance
 *
 * Optimisasi:
 * 1. State modal (selectedProduct + isOpen) DIPINDAH ke komponen
 *    ProductRow terpisah, sehingga membuka modal hanya me-re-render
 *    satu baris, bukan seluruh tabel.
 * 2. Modal di-lazy-load via next/dynamic + conditional render
 *    {isOpen && <Modal />} agar tidak ada DOM cost saat tertutup.
 * 3. useTransition dipakai pada operasi delete agar UI tidak freeze.
 * 4. Animasi hanya pakai transform + opacity (GPU-composited).
 */

import Image from "next/image";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState, useTransition, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { deleteProduct } from "@/src/actions/product-actions";

// ── Lazy-load modals — tidak masuk DOM saat tidak diperlukan ──────────────────
const ConfirmDeleteModal = dynamic(
  () =>
    import("@/src/components/confirm-delete-modal").then(
      (m) => m.ConfirmDeleteModal,
    ),
  { ssr: false },
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  stockCritical: number;
  imageUrl: string | null;
  description?: string | null;
  createdAt?: string | Date;
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

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Asset Inspection Modal ───────────────────────────────────────────────────
// Terpisah dari row agar re-render-nya terisolasi

interface AssetModalProps {
  product: ProductRow;
  onClose: () => void;
}

const AssetModal = memo(function AssetModal({
  product,
  onClose,
}: AssetModalProps) {
  const modalContent = (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-inspection-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
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
        className="w-full max-w-lg overflow-hidden rounded-md border border-primary/50 bg-secondary/90 p-6 shadow-[0_0_30px_rgba(14,165,233,0.3)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2
            id="asset-inspection-title"
            className="font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground"
          >
            DETAIL PRODUK // #{product.id.substring(0, 8)}
          </h2>
          <button
            type="button"
            onClick={onClose}
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
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-2xl font-medium text-muted-foreground">
                  {getInitials(product.name)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-mono text-xl font-semibold tracking-tight text-foreground">
                {product.name}
              </h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm">
                <dt className="text-muted-foreground uppercase tracking-wider">
                  Status
                </dt>
                <dd>
                  <span
                    className={cn(
                      "inline-block rounded px-2 py-0.5 text-xs font-medium uppercase",
                      product.stock > 0
                        ? "bg-chart-2/20 text-chart-2"
                        : "bg-destructive/20 text-destructive",
                    )}
                  >
                    {product.stock > 0 ? "TERSEDIA" : "STOK HABIS"}
                  </span>
                </dd>
                <dt className="text-muted-foreground uppercase tracking-wider">
                  Harga
                </dt>
                <dd className="tabular-nums text-foreground">
                  {formatRupiah(product.price)}
                </dd>
                <dt className="text-muted-foreground uppercase tracking-wider">
                  Stok
                </dt>
                <dd className="tabular-nums text-foreground">
                  {product.stock}
                </dd>
                <dt className="text-muted-foreground uppercase tracking-wider">
                  Batas Aman
                </dt>
                <dd className="tabular-nums text-foreground">
                  {product.stockCritical}
                </dd>
                {product.createdAt && (
                  <>
                    <dt className="text-muted-foreground uppercase tracking-wider">
                      TGL MASUK
                    </dt>
                    <dd className="tabular-nums text-foreground">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(product.createdAt))}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          {product.description != null && product.description !== "" ? (
            <div className="border-t border-border/60 pt-4">
              <dt className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Deskripsi
              </dt>
              <p className="font-mono text-sm text-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
});

// ─── Single Row — state modal TERISOLASI di sini ──────────────────────────────
// Membuka modal hanya me-re-render baris ini, bukan seluruh tabel.

interface RowProps {
  product: ProductRow;
  showActions: boolean;
  onDeleteRequest: (id: string) => void;
  isDeletingThis: boolean;
}

const ProductTableRow = memo(function ProductTableRow({
  product,
  showActions,
  onDeleteRequest,
  isDeletingThis,
}: RowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <motion.tr
        key={product.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
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
                : "bg-destructive/20 text-destructive",
            )}
          >
            {product.stock > 0 ? "TERSEDIA" : "STOK HABIS"}
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
              <Link
                href={`/dashboard/products/${product.id}/edit`}
                className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary dark:hover:bg-white/10 dark:hover:text-primary"
                aria-label="Edit"
                onClick={(e) => e.stopPropagation()}
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(product.id);
                }}
                disabled={isDeletingThis}
                className="rounded-md p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Delete"
              >
                {isDeletingThis ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </td>
        )}
      </motion.tr>

      {/* Modal hanya di-mount saat isOpen === true */}
      <AnimatePresence>
        {isOpen && <AssetModal product={product} onClose={close} />}
      </AnimatePresence>
    </>
  );
});

// ─── ProductsTable (parent — hanya kelola delete state) ───────────────────────

interface ProductsTableProps {
  products: ProductRow[];
  className?: string;
  /** When true, shows ACTIONS column with Edit/Delete buttons (e.g. for inventory page). */
  showActions?: boolean;
}

export function ProductsTable({
  products,
  className,
  showActions = false,
}: ProductsTableProps) {
  const colCount = showActions ? 7 : 6;
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  function handleConfirmDelete() {
    if (!deletingId) return;
    const idToDelete = deletingId;
    startTransition(() => {
      deleteProduct(idToDelete)
        .then(() => setDeletingId(null))
        .catch(() => setDeletingId(null));
    });
  }

  return (
    <>
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
                  ID
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Nama Produk
                </th>
                <th className="w-[120px] px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="w-[72px] px-4 py-4 text-left text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Gambar
                </th>
                <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Harga
                </th>
                <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Stok
                </th>
                {showActions && (
                  <th className="px-4 py-4 text-right text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400">
                    AKSI
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="relative">
              <AnimatePresence mode="popLayout" initial={false}>
                {products.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <td
                      colSpan={colCount}
                      className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                    >
                      Belum ada produk.
                    </td>
                  </motion.tr>
                ) : (
                  products.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      showActions={showActions}
                      onDeleteRequest={handleDeleteRequest}
                      isDeletingThis={isPending && deletingId === product.id}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ConfirmDeleteModal lazy-loaded, hanya mount saat deletingId ada */}
      {deletingId !== null && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeletingId(null)}
          onConfirm={handleConfirmDelete}
          isPending={isPending}
        />
      )}
    </>
  );
}
