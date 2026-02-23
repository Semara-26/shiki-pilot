import { Sidebar } from "@/src/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-[#111111] transition-colors duration-300 dark:bg-[#0a0a0a] dark:text-white">
      <Sidebar />
      <main className="flex h-full w-full flex-1 flex-col min-w-0 overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {children}
      </main>
    </div>
  );
}
