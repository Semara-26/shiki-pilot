import Link from "next/link";
import { BarChart3, ArrowLeft } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
      <div className="flex-none">
        <header className="sticky top-0 z-30 border-b-2 border-ink dark:border-white/10 bg-white dark:bg-surface-dark px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-widest text-ink dark:text-white">
            TERMINAL / ANALYTICS
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-ink dark:text-white md:text-2xl">
            ANALYTICS MODULE // LOADING
          </h1>
        </header>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
        <div className="rounded-md border-2 border-ink dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-neo dark:shadow-none p-10 text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink dark:border-white/20 bg-paper dark:bg-white/5">
            <BarChart3 className="h-8 w-8 text-ink dark:text-white" />
          </div>
          <h2 className="font-mono text-lg font-black uppercase tracking-wider text-ink dark:text-white">
            Under Construction
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            AI is gathering intelligence... Feature coming soon.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
