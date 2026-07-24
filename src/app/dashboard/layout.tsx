import { Sidebar } from "@/src/components/sidebar";
import { SidebarProvider } from "@/src/components/sidebar-context";
import { ProfileProvider } from "@/src/components/profile-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProfileProvider>
        <div className="flex h-screen w-full overflow-hidden bg-white text-ink transition-colors duration-300 dark:bg-surface-dark dark:text-white">
          <Sidebar />
          <main className="flex h-full w-full flex-1 flex-col min-w-0 overflow-y-auto bg-white dark:bg-surface-dark">
            {children}
          </main>
        </div>
      </ProfileProvider>
    </SidebarProvider>
  );
}
