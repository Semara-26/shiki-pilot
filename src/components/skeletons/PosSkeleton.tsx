import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function PosSkeleton() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-y-auto bg-paper dark:bg-ink pb-16 lg:h-full">
      {/* Header Mimic */}
      <div className="flex-none">
        <header className="sticky top-0 z-30 border-b-2 border-ink bg-white dark:border-white/10 dark:bg-surface-dark">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <PhantomSkeleton className="h-6 w-6 rounded-md" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <PhantomSkeleton className="h-3 w-32" />
                <PhantomSkeleton className="h-6 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PhantomSkeleton className="relative flex h-9 w-9 items-center justify-center rounded-md" />
            </div>
          </div>
        </header>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-8 w-full p-4">
          {/* 1. BAGIAN ATAS: Katalog Produk & Search */}
          <div className="flex flex-col gap-4 w-full">
            <PhantomSkeleton className="h-4 w-32 rounded-md" />{" "}
            {/* Label Katalog */}
            <PhantomSkeleton className="h-12 w-full rounded-lg" />{" "}
            {/* Search Bar */}
            {/* Deretan Card Produk */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <PhantomSkeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* 2. BAGIAN TENGAH: Keranjang */}
          <div className="flex flex-col gap-4 w-full">
            <PhantomSkeleton className="h-4 w-28 rounded-md" />{" "}
            {/* Label Keranjang */}
            <PhantomSkeleton className="h-40 w-full rounded-xl" />{" "}
            {/* Box Keranjang Kosong */}
          </div>

          {/* 3. BAGIAN BAWAH: Checkout & Pembayaran */}
          <div className="flex flex-col gap-4 w-full">
            {/* Grand Total */}
            <div className="flex justify-between items-center w-full">
              <PhantomSkeleton className="h-5 w-24 rounded-md" />
              <PhantomSkeleton className="h-8 w-32 rounded-md" />
            </div>

            {/* Uang Diterima & Kembalian */}
            <PhantomSkeleton className="h-4 w-32 rounded-md mt-2" />
            <PhantomSkeleton className="h-14 w-full rounded-xl" />
            <PhantomSkeleton className="h-14 w-full rounded-xl" />

            {/* Tombol Cash & QRIS */}
            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <PhantomSkeleton className="h-14 w-full rounded-xl" />
              <PhantomSkeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosSkeleton;
