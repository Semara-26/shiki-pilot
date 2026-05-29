import { PhantomSkeleton } from "../ui/phantom-skeleton";

export function ChatSkeleton() {
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

      {/* Konten Utama (Tiruan Antarmuka Chat) */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto w-full mt-8">
          {/* Chat 1 (User) */}
          <PhantomSkeleton className="h-10 w-1/3 self-end rounded-lg" />

          {/* Chat 2 (AI) */}
          <div className="flex flex-col gap-2 w-3/4">
            <PhantomSkeleton className="h-4 w-full rounded-sm" />
            <PhantomSkeleton className="h-4 w-full rounded-sm" />
            <PhantomSkeleton className="h-4 w-2/3 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="flex-none p-4 max-w-3xl mx-auto w-full">
        <PhantomSkeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  );
}

export default ChatSkeleton;
