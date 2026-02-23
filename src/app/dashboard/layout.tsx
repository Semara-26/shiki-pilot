import { Sidebar } from "@/src/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-ink transition-colors duration-300 dark:bg-surface-dark dark:text-white">
      <Sidebar />
      <main className="flex h-full w-full flex-1 flex-col min-w-0 overflow-hidden bg-white dark:bg-surface-dark">
        {children}
      </main>
    </div>
  );
}
