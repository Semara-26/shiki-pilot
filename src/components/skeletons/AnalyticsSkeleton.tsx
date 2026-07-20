import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function AnalyticsSkeleton() {
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
        <div className="space-y-4 md:space-y-6 p-4 md:p-6 w-full">
          {/* 1. Bagian Atas (Tren Pendapatan) */}
          <div className="rounded-lg border-2 border-ink dark:border-white/20 p-4 md:p-6 bg-white dark:bg-[#0a0a0a]">
            <div className="mb-4 flex flex-col gap-3 md:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PhantomSkeleton className="h-4 w-40" />
              <div className="flex flex-wrap items-center gap-2">
                <PhantomSkeleton className="h-8 w-28 rounded-md" />
                <PhantomSkeleton className="h-8 w-40 rounded-md" />
              </div>
            </div>
            <PhantomSkeleton className="w-full min-h-[300px] h-[300px] md:h-[320px] rounded-md" />
          </div>

          {/* 2. Bagian Bawah (Grid 2 Kolom) */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
            {/* Kolom Kiri: Produk Terlaris (Bar Chart) */}
            <div className="flex w-full flex-col rounded-lg border-2 border-ink dark:border-white/20 p-4 md:p-6 bg-white dark:bg-[#0a0a0a]">
              <PhantomSkeleton className="h-4 w-64 mb-6" />
              <div className="flex flex-col gap-6 flex-1 justify-center py-4">
                <div className="flex items-center gap-4"><PhantomSkeleton className="h-4 w-24 shrink-0" /><PhantomSkeleton className="h-8 w-full rounded-r-md" /></div>
                <div className="flex items-center gap-4"><PhantomSkeleton className="h-4 w-24 shrink-0" /><PhantomSkeleton className="h-8 w-4/5 rounded-r-md" /></div>
                <div className="flex items-center gap-4"><PhantomSkeleton className="h-4 w-24 shrink-0" /><PhantomSkeleton className="h-8 w-1/2 rounded-r-md" /></div>
                <div className="flex items-center gap-4"><PhantomSkeleton className="h-4 w-24 shrink-0" /><PhantomSkeleton className="h-8 w-2/3 rounded-r-md" /></div>
                <div className="flex items-center gap-4"><PhantomSkeleton className="h-4 w-24 shrink-0" /><PhantomSkeleton className="h-8 w-1/3 rounded-r-md" /></div>
              </div>
            </div>

            {/* Kolom Kanan: Kontribusi Pendapatan (Donut Chart) */}
            <div className="flex flex-col rounded-lg border-2 border-ink dark:border-white/20 p-4 md:p-6 bg-white dark:bg-[#0a0a0a]">
              <PhantomSkeleton className="h-4 w-48 mb-6 shrink-0" />
              <div className="flex flex-col gap-4">
                <div className="w-full min-h-[320px] h-[320px] shrink-0 flex items-center justify-center relative">
                  {/* Skeleton bentuk lingkaran - Donut Shape */}
                  <div className="relative flex items-center justify-center">
                    <PhantomSkeleton className="h-56 w-56 rounded-full" />
                    {/* Inner circle (cutout for donut) */}
                    <div className="absolute h-32 w-32 rounded-full bg-white dark:bg-[#0a0a0a]" />
                  </div>
                </div>
                {/* Area Legend */}
                <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-white/10 pt-4">
                  <div className="flex items-center gap-2"><PhantomSkeleton className="h-3 w-3 rounded-full shrink-0" /><PhantomSkeleton className="h-4 w-full" /></div>
                  <div className="flex items-center gap-2"><PhantomSkeleton className="h-3 w-3 rounded-full shrink-0" /><PhantomSkeleton className="h-4 w-5/6" /></div>
                  <div className="flex items-center gap-2"><PhantomSkeleton className="h-3 w-3 rounded-full shrink-0" /><PhantomSkeleton className="h-4 w-4/5" /></div>
                  <div className="flex items-center gap-2"><PhantomSkeleton className="h-3 w-3 rounded-full shrink-0" /><PhantomSkeleton className="h-4 w-2/3" /></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 3. Baris Ketiga (AI Insight) */}
          <div className="rounded-lg border-2 border-ink dark:border-white/20 p-4 md:p-6 bg-white dark:bg-[#0a0a0a]">
            <div className="mb-4 flex items-center gap-2">
              <PhantomSkeleton className="h-8 w-8 rounded-md shrink-0" />
              <PhantomSkeleton className="h-4 w-32" />
            </div>
            <PhantomSkeleton className="h-10 w-48 rounded-md mb-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSkeleton;
