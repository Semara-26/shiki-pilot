export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background p-6">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-3 w-32 animate-pulse rounded-md bg-secondary/50" />
        <div className="h-7 w-48 animate-pulse rounded-md bg-secondary/50" />
      </div>

      {/* Metrics row skeleton (4 cards) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-md bg-secondary/50 p-4"
          >
            <div className="mb-2 h-3 w-20 rounded-md bg-secondary/70" />
            <div className="h-8 w-24 rounded-md bg-secondary/70" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="flex-1 animate-pulse rounded-md bg-secondary/50">
        <div className="border-b border-border/50 px-4 py-4">
          <div className="h-4 w-full rounded-md bg-secondary/70" />
        </div>
        <div className="space-y-0 border-border/50">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex gap-4 border-b border-border/30 px-4 py-4"
            >
              <div className="h-4 w-12 rounded-md bg-secondary/70" />
              <div className="h-4 flex-1 max-w-[200px] rounded-md bg-secondary/70" />
              <div className="h-4 w-16 rounded-md bg-secondary/70" />
              <div className="h-4 w-16 rounded-md bg-secondary/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
