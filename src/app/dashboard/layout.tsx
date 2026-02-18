import { Sidebar } from "@/src/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex h-full w-full flex-1 flex-col min-w-0 overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}
