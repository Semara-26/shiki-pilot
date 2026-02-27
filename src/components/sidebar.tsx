"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Package,
  BarChart3,
  MessageSquare,
  PlusCircle,
  ShoppingCart,
  User,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { OperatorIdPanel } from "@/src/components/operator-id-panel";
import { useSidebar } from "@/src/components/sidebar-context";

const motionLinkProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/pos", label: "POS", icon: ShoppingCart },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/products/new", label: "Add Product", icon: PlusCircle },
];

const MAX_NAME_LENGTH = 16;

function truncateWithEllipsis(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 3)}...`;
}

export function SidebarTrigger() {
  const sidebar = useSidebar();
  if (!sidebar) return null;
  return (
    <button
      type="button"
      onClick={sidebar.toggle}
      className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-ink dark:border-white/20 text-ink dark:text-white hover:bg-ink hover:text-white dark:hover:bg-white/20 dark:hover:text-white transition-colors"
      aria-label="Buka menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const sidebar = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName
    ? truncateWithEllipsis(user.fullName, MAX_NAME_LENGTH)
    : "SYSTEM_OPERATOR";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const sidebarContent = (
    <>
      {/* Logo: red square + 会社, SHIKIPILOT on hover */}
      <motion.div {...motionLinkProps} className="shrink-0">
        <Link
          href="/dashboard"
          onClick={sidebar?.close}
          className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4 transition-colors hover:bg-white dark:border-white/10 dark:hover:bg-white/5"
        >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="font-mono text-lg font-bold">会社</span>
        </div>
        <span className={cn(
          "whitespace-nowrap text-sm font-semibold tracking-[0.2em] text-gray-700 transition-opacity duration-200 dark:text-sidebar-foreground",
          sidebar?.isOpen ? "block opacity-100" : "hidden opacity-0 group-hover:block group-hover:opacity-100 md:group-hover:block md:group-hover:opacity-100"
        )}>
          SHIKIPILOT
        </span>
        </Link>
      </motion.div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <motion.div key={`${item.href}-${item.label}`} {...motionLinkProps}>
              <Link
                href={item.href}
                onClick={sidebar?.close}
                className={cn(
                  "relative flex items-center gap-3 border-r-2 border-transparent px-4 py-3 text-sm transition-colors",
                  "text-gray-600 hover:bg-white hover:text-primary dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
                  isActive && "border-primary font-medium text-primary dark:bg-white/5"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  sidebar?.isOpen ? "block opacity-100" : "hidden opacity-0 group-hover:block group-hover:opacity-100 md:group-hover:block md:group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className={cn("ml-auto", sidebar?.isOpen ? "block" : "hidden group-hover:block")} />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User profile — Operator ID Panel trigger */}
      <div ref={profileRef} className="relative border-t border-gray-200 p-4 dark:border-white/10">
        <button
          type="button"
          onClick={() => setIsProfileOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-md transition-colors hover:bg-white dark:hover:bg-white/5"
          aria-expanded={isProfileOpen}
          aria-label="Operator profile"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white dark:border-white/10 dark:bg-white/10">
            {!isLoaded ? (
              <span className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-white/20" />
            ) : user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-gray-600 dark:text-sidebar-foreground" />
            )}
          </div>
          <div className={cn(
            "min-w-0 overflow-hidden text-left transition-opacity duration-200",
            sidebar?.isOpen ? "block opacity-100" : "hidden opacity-0 group-hover:block group-hover:opacity-100 md:group-hover:block md:group-hover:opacity-100"
          )}>
            <p className="truncate text-xs font-medium text-gray-700 dark:text-sidebar-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? "Operator"}
            </p>
          </div>
        </button>
        <OperatorIdPanel
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop - mobile only */}
      <AnimatePresence>
        {sidebar?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={sidebar.close}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Sidebar - mobile: slide-in overlay; desktop: always visible */}
      <aside
        className={cn(
          "group z-50 flex h-full shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-gray-50 text-sidebar-foreground dark:border-white/10 dark:bg-[#0a0a0a] dark:text-sidebar-foreground",
          "transition-[transform,width] duration-300 ease-out",
          "fixed inset-y-0 left-0 w-64 md:relative md:inset-auto md:w-20 md:hover:w-64",
          sidebar?.isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      {sidebarContent}
    </aside>
    </>
  );
}
