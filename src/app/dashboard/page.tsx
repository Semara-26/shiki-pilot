import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";

import { getStoreForDashboard } from "@/src/lib/dashboard-data";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { PageContainer } from "@/src/components/page-animation";
import {
  DashboardSections,
  DashboardHeaderServer,
  MetricsSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from "./_components/dashboard-sections";

// Beri tahu Next.js agar halaman ini selalu di-render fresh di server
// (tidak di-static-generate), tapi data di dalamnya tetap di-cache via
// unstable_cache masing-masing fungsi di dashboard-data.ts.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  // Resolve store — hanya fetch kolom minimal (id, name)
  const userStore = userId ? await getStoreForDashboard(userId) : null;

  // ── State: belum punya toko ───────────────────────────────────────────────
  if (!userStore) {
    return (
      <PageContainer className="h-full w-full">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-none">
            <DashboardHeader breadcrumbs="TERMINAL" title="WELCOME" />
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex min-h-full items-center justify-center">
              <div className="rounded-md border border-border bg-card p-8 text-center max-w-md">
                <h1 className="text-xl font-semibold text-foreground mb-2">
                  Selamat Datang di Cockpit
                </h1>
                <p className="text-muted-foreground mb-6 text-sm">
                  Buat toko pertama Anda untuk mulai mengelola produk dan chat.
                </p>
                <Link
                  href="/dashboard/create-store"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  + Buat Toko Pertama
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── State: punya toko ─────────────────────────────────────────────────────
  return (
    <PageContainer className="h-full w-full">
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header mengambil data produknya sendiri via DashboardHeaderServer */}
        <div className="flex-none">
          <Suspense fallback={<DashboardHeader />}>
            <DashboardHeaderServer storeId={userStore.id} />
          </Suspense>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/*
            DashboardSections membungkus setiap sub-section dengan
            Suspense-nya masing-masing, sehingga konten "streaming"
            ke browser secepat masing-masing query selesai.
          */}
          <Suspense
            fallback={
              <div className="flex flex-col gap-4 md:gap-6">
                <MetricsSkeleton />
                <TableSkeleton />
                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 lg:min-h-[350px]">
                  <ChartSkeleton />
                  <ChartSkeleton />
                  <ChartSkeleton />
                </div>
              </div>
            }
          >
            <DashboardSections storeId={userStore.id} />
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
}
