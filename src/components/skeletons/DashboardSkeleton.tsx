import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function DashboardSkeleton() {
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

      <div className="flex-1 overflow-y-auto">
        {/* Konten Utama sesuai Blueprint */}
        <div className="flex flex-col gap-6 w-full p-4">
          {/* 1. Baris Atas: 4 Kartu Statistik (Grid 4 Kolom) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <PhantomSkeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>

          {/* 2. Tengah: Banner Notifikasi Sistem */}
          <PhantomSkeleton className="h-12 w-full rounded-lg" />

          {/* 3. Bawah: Area Tabel (Recent Assets) */}
          <div className="flex flex-col gap-4 mt-2">
            {/* Header Tabel (Judul & Link) */}
            <div className="flex justify-between items-center w-full">
              <PhantomSkeleton className="h-5 w-32 rounded-md" />
              <PhantomSkeleton className="h-5 w-24 rounded-md" />
            </div>

            {/* Isi Tabel (List Item) */}
            <div className="flex flex-col gap-2">
              {/* Header Kolom */}
              <PhantomSkeleton className="h-10 w-full rounded-lg mb-2 opacity-70" />
              {/* Baris Data */}
              {Array.from({ length: 5 }).map((_, i) => (
                <PhantomSkeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
