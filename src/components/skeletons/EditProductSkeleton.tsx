import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function EditProductSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header Mimic */}
      <div className="flex-none">
        <header className="sticky top-0 z-30 border-b border-border bg-background">
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
          <div className="rounded-md border border-border bg-card overflow-hidden">
            {/* Form Header */}
            <div className="border-b border-border px-6 py-5">
              <PhantomSkeleton className="mb-2 h-6 w-32" />
              <PhantomSkeleton className="h-4 w-3/4" />
            </div>

            {/* Form Body */}
            <div className="space-y-6 p-6">
              {/* Nama Produk */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-28" />
                <PhantomSkeleton className="h-[42px] w-full rounded-md" />
              </div>

              {/* Gambar Produk */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-40" />
                <PhantomSkeleton className="h-32 w-full rounded-md border-2 border-dashed border-border bg-transparent" />
              </div>

              {/* Harga & Stok (2 columns) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <PhantomSkeleton className="h-4 w-24" />
                  <PhantomSkeleton className="h-[42px] w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <PhantomSkeleton className="h-4 w-16" />
                  <PhantomSkeleton className="h-[42px] w-full rounded-md" />
                </div>
              </div>

              {/* Batas Stok Kritis */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-48" />
                <PhantomSkeleton className="h-[42px] w-full rounded-md" />
                <PhantomSkeleton className="h-3 w-full opacity-70" />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <PhantomSkeleton className="h-4 w-24" />
                <PhantomSkeleton className="h-[114px] w-full rounded-md" />
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4">
              <PhantomSkeleton className="h-10 w-24 rounded-md" />
              <PhantomSkeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProductSkeleton;
