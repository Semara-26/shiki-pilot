"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  BarChart3,
  PlusCircle,
  User,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/dashboard", label: "Inventory", icon: Package, exact: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/products/new", label: "Add Product", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "group z-50 flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "w-20 transition-[width] duration-300 ease-out hover:w-64"
      )}
    >
      {/* Logo: red square + 会社, SHIKIPILOT on hover */}
      <Link
        href="/dashboard"
        className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4 transition-colors hover:bg-sidebar-accent"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="font-mono text-lg font-bold">会社</span>
        </div>
        <span className="hidden whitespace-nowrap text-sm font-semibold tracking-[0.2em] text-sidebar-foreground opacity-0 transition-opacity duration-200 group-hover:block group-hover:opacity-100">
          SHIKIPILOT
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 border-r-2 border-transparent px-4 py-3 text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "border-primary bg-sidebar-accent font-medium text-primary"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:block group-hover:opacity-100">
                {item.label}
              </span>
              {isActive && (
                <ChevronRight className="ml-auto hidden group-hover:block" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          <div className="hidden min-w-0 overflow-hidden transition-opacity duration-200 group-hover:block group-hover:opacity-100">
            <p className="truncate text-xs font-medium text-sidebar-foreground">
              Profile
            </p>
            <p className="truncate text-xs text-muted-foreground">User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
