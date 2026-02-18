import Link from "next/link";
import { BarChart3, ArrowLeft } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            TERMINAL / ANALYTICS
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            ANALYTICS MODULE // LOADING
          </h1>
        </header>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
        <div className="rounded-md border border-border bg-card p-10 text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-mono text-lg font-semibold uppercase tracking-wider text-foreground">
            Under Construction
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
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
