import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function TransactionsSkeleton() {
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
        <div className="flex flex-col gap-6">
          {/* Filters Area */}
          <div className="rounded-lg border-2 border-ink bg-white dark:border-white/10 dark:bg-[#0a0a0a] p-4 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <PhantomSkeleton className="h-4 w-32" />
              <PhantomSkeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <PhantomSkeleton className="h-4 w-24" />
              <PhantomSkeleton className="h-10 w-40 rounded-md" />
            </div>
            <div className="space-y-2">
              <PhantomSkeleton className="h-4 w-24" />
              <PhantomSkeleton className="h-10 w-40 rounded-md" />
            </div>
            <PhantomSkeleton className="h-10 w-32 rounded-md shrink-0" />
          </div>

          {/* Table Area */}
          <div className="rounded-lg border-2 border-ink bg-white dark:border-white/10 dark:bg-[#0a0a0a] overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b-2 border-ink dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
              <PhantomSkeleton className="h-4 w-32" />
              <PhantomSkeleton className="h-4 w-32 hidden md:block" />
              <PhantomSkeleton className="h-4 w-32 hidden lg:block" />
              <PhantomSkeleton className="h-4 w-24" />
              <PhantomSkeleton className="h-4 w-24" />
              <PhantomSkeleton className="h-4 w-32 text-right" />
            </div>
            
            {/* Table Rows */}
            <div className="flex flex-col">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 p-4 last:border-0">
                  <div className="space-y-2">
                    <PhantomSkeleton className="h-4 w-24" />
                    <PhantomSkeleton className="h-3 w-32 opacity-70" />
                  </div>
                  <PhantomSkeleton className="h-4 w-32 hidden md:block" />
                  <PhantomSkeleton className="h-4 w-32 hidden lg:block" />
                  <PhantomSkeleton className="h-4 w-16" />
                  <PhantomSkeleton className="h-6 w-16 rounded-full" />
                  <PhantomSkeleton className="h-4 w-24 text-right" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionsSkeleton;
