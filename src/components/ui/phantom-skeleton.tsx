import { cn } from "@/src/lib/utils";

export type PhantomSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * PhantomSkeleton — Komponen loading skeleton dengan shimmer effect.
 *
 * Teknik animasi mengacu pada Phantom UI (Aejkatappaja/phantom-ui):
 * - Background dasar gelap (zinc-800)
 * - Gradient transparan → terang → transparan (via zinc-600/50)
 * - background-size: 200% 100% agar gradien lebih lebar dari elemennya
 * - Animasi menggerakkan background-position dari -200% ke 200%
 *   (BUKAN translateX — itu hanya memindahkan elemen, bukan cahayanya)
 *
 * Referensi CSS equivalent:
 *   background: linear-gradient(90deg, transparent 30%, rgba(zinc-600, 0.5) 50%, transparent 70%)
 *   background-size: 200% 100%;
 *   animation: shimmer 1.8s linear infinite;
 */
export function PhantomSkeleton({ className, ...props }: PhantomSkeletonProps) {
  return (
    <div
      className={cn(
        // Base: background gelap sesuai dark theme ShikiPilot
        "rounded-md bg-zinc-800",
        // Shimmer: gradient yang bergerak (background-position animation)
        "bg-[length:200%_100%]",
        "bg-gradient-to-r from-zinc-800 via-zinc-600/50 to-zinc-800",
        // Animasi keyframe "shimmer" didefinisikan di tailwind.config.ts
        // menggerakkan background-position dari -200% ke 200%
        "animate-shimmer",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

// ─── Preset Skeleton Structures ──────────────────────────────────────────────
// Komponen-komponen ini meniru struktur UI aslinya agar transisi terasa natural.

/** Skeleton untuk baris header tabel (label kolom) */
export function TableHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-zinc-800 px-4 py-3">
      <PhantomSkeleton className="h-3 w-10 shrink-0" />
      <PhantomSkeleton className="h-3 flex-1 max-w-[180px]" />
      <PhantomSkeleton className="h-3 w-16 shrink-0" />
      <PhantomSkeleton className="h-3 w-14 shrink-0" />
      <PhantomSkeleton className="h-3 w-14 shrink-0 hidden sm:block" />
    </div>
  );
}

/** Skeleton untuk satu baris data produk di tabel */
export function TableRowSkeleton({ index = 0 }: { index?: number }) {
  // Variasi lebar name agar tidak identik antar baris (lebih natural)
  const nameWidths = [
    "max-w-[120px]",
    "max-w-[160px]",
    "max-w-[140px]",
    "max-w-[100px]",
    "max-w-[180px]",
  ];
  const nameWidth = nameWidths[index % nameWidths.length];

  return (
    <div className="flex items-center gap-4 border-b border-zinc-800/50 px-4 py-4">
      {/* Nomor / index */}
      <PhantomSkeleton className="h-4 w-8 shrink-0" />
      {/* Nama produk */}
      <PhantomSkeleton className={`h-4 flex-1 ${nameWidth}`} />
      {/* Harga */}
      <PhantomSkeleton className="h-4 w-20 shrink-0" />
      {/* Stok */}
      <PhantomSkeleton className="h-4 w-12 shrink-0" />
      {/* Badge/action (tersembunyi di mobile) */}
      <PhantomSkeleton className="h-6 w-16 rounded-full shrink-0 hidden sm:block" />
    </div>
  );
}

/** Skeleton untuk tabel produk lengkap (header + 8 baris) */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
      {/* Toolbar skeleton (search + filter) */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <PhantomSkeleton className="h-8 w-48 rounded-md" />
        <div className="flex gap-2">
          <PhantomSkeleton className="h-8 w-24 rounded-md" />
          <PhantomSkeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      {/* Header kolom */}
      <TableHeaderSkeleton />
      {/* Baris data */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} index={i} />
      ))}
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
        <PhantomSkeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <PhantomSkeleton className="h-8 w-8 rounded-md" />
          <PhantomSkeleton className="h-8 w-8 rounded-md" />
          <PhantomSkeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton untuk satu kartu metrik (Total Produk, Total Stok, dll) */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <PhantomSkeleton className="h-3 w-24" />
        <PhantomSkeleton className="h-6 w-6 rounded-md" />
      </div>
      <PhantomSkeleton className="h-8 w-28" />
      <PhantomSkeleton className="h-3 w-20" />
    </div>
  );
}

/** Skeleton untuk grid 4 kartu metrik */
export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton untuk area chart / grafik */
export function ChartSkeleton({ minHeight = 300 }: { minHeight?: number }) {
  return (
    <div
      className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 p-4"
      style={{ minHeight }}
    >
      {/* Chart title area */}
      <div className="mb-4 flex items-center justify-between">
        <PhantomSkeleton className="h-4 w-32" />
        <PhantomSkeleton className="h-6 w-20 rounded-full" />
      </div>
      {/* Chart body — batang-batang vertikal untuk mensimulasikan bar chart */}
      <div
        className="flex items-end gap-2 px-2"
        style={{ height: minHeight - 80 }}
      >
        {[60, 80, 45, 90, 70, 55, 85, 65, 75, 50, 88, 72].map((h, i) => (
          <PhantomSkeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
