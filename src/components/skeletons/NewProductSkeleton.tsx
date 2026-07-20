import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function NewProductSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
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

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-lg border-2 border-ink bg-white dark:border-white/10 dark:bg-[#0a0a0a]">
            {/* Form Header */}
            <div className="border-b-2 border-ink p-6 dark:border-white/10">
              <PhantomSkeleton className="mb-2 h-5 w-48" />
              <PhantomSkeleton className="h-4 w-3/4" />
            </div>

            {/* Form Body */}
            <div className="space-y-6 p-6">
              {/* Nama Produk */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-28" />
                <PhantomSkeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Gambar Produk */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-40" />
                <PhantomSkeleton className="h-32 w-full rounded-md border-2 border-dashed border-zinc-700 bg-transparent" />
              </div>

              {/* Harga & Stok (2 columns) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <PhantomSkeleton className="h-4 w-24" />
                  <PhantomSkeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <PhantomSkeleton className="h-4 w-16" />
                  <PhantomSkeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Batas Stok Kritis */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-48" />
                <PhantomSkeleton className="h-10 w-full rounded-md" />
                <PhantomSkeleton className="h-3 w-full opacity-70" />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-24" />
                <PhantomSkeleton className="h-28 w-full rounded-md" />
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-between border-t-2 border-ink bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
              <PhantomSkeleton className="h-10 w-24 rounded-md" />
              <PhantomSkeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewProductSkeleton;
