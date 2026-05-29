import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function TableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex-none">
          {/* DashboardHeader Mimic */}
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
        <div className="p-6">
          {/* Search/Filter Toolbar Mimic */}
          <div className="mb-6 flex w-full justify-between items-center gap-4">
            <PhantomSkeleton className="h-10 flex-1 rounded-md" />
            <PhantomSkeleton className="h-10 w-[140px] rounded-md hidden sm:block" />
          </div>

          {/* ProductsTable Mimic */}
          <div className="rounded-lg overflow-hidden border-2 border-ink bg-white dark:border-white/10 dark:bg-surface-dark">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-ink bg-paper uppercase dark:border-white/10 dark:bg-black/40">
                    <th className="px-4 py-4 text-left">
                      <PhantomSkeleton className="h-4 w-8" />
                    </th>
                    <th className="px-4 py-4 text-left">
                      <PhantomSkeleton className="h-4 w-32" />
                    </th>
                    <th className="w-[120px] px-4 py-4 text-left">
                      <PhantomSkeleton className="h-4 w-16" />
                    </th>
                    <th className="w-[72px] px-4 py-4 text-left">
                      <PhantomSkeleton className="h-4 w-12" />
                    </th>
                    <th className="px-4 py-4 text-right">
                      <div className="flex justify-end">
                        <PhantomSkeleton className="h-4 w-20" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-right">
                      <div className="flex justify-end">
                        <PhantomSkeleton className="h-4 w-12" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-right">
                      <div className="flex justify-end">
                        <PhantomSkeleton className="h-4 w-16" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="relative">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200 dark:border-white/5"
                    >
                      <td className="px-4 py-4">
                        <PhantomSkeleton className="h-4 w-12" />
                      </td>
                      <td className="px-4 py-4">
                        <PhantomSkeleton className="h-4 w-48" />
                      </td>
                      <td className="px-4 py-4">
                        <PhantomSkeleton className="h-6 w-20 rounded-md" />
                      </td>
                      <td className="px-4 py-4">
                        <PhantomSkeleton className="h-10 w-10 rounded-full" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <PhantomSkeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <PhantomSkeleton className="h-4 w-8" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <PhantomSkeleton className="h-8 w-16 rounded-md" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableSkeleton;
