"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/src/components/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

export interface DashboardHeaderProduct {
  id: string;
  name: string;
  stock: number;
}

interface DashboardHeaderProps {
  breadcrumbs?: string;
  title?: string;
  products?: DashboardHeaderProduct[];
  actions?: React.ReactNode;
  className?: string;
}

const LOW_STOCK_THRESHOLD = 10;

export function DashboardHeader({
  breadcrumbs = "TERMINAL / ACTIVE PROJECTS",
  title = "DATA REPOSITORY",
  products = [],
  actions,
  className,
}: DashboardHeaderProps) {
  const lowStockProducts = products.filter((p) => p.stock < LOW_STOCK_THRESHOLD);
  const hasAlerts = lowStockProducts.length > 0;
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b-2 border-ink bg-white backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-white/10 dark:bg-surface-dark",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {breadcrumbs}
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-ink md:text-2xl dark:text-white">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-48 rounded-md border border-ink/20 bg-white pl-9 pr-3 text-sm text-ink placeholder:text-gray-500 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-white/10 dark:bg-surface-dark dark:text-white dark:placeholder:text-gray-400"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-ink/20 bg-white text-ink transition-colors hover:bg-paper hover:text-ink dark:border-white/10 dark:bg-surface-dark dark:text-white dark:hover:bg-white/10"
              aria-label="Notifications"
              aria-expanded={isNotifOpen}
            >
              <Bell className="h-4 w-4" />
              {hasAlerts && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary animate-pulse"
                  aria-hidden
                />
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className="absolute right-0 top-full z-50 mt-4 w-80 rounded-md border border-primary/50 bg-secondary/95 shadow-[0_0_20px_rgba(242,13,13,0.2)] backdrop-blur-md"
                >
                  <div className="border-b border-primary/30 px-4 py-3">
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      SYSTEM ALERTS
                    </p>
                  </div>
                  <ul className="max-h-64 overflow-y-auto">
                    {hasAlerts ? (
                      lowStockProducts.map((p) => (
                        <li key={p.id}>
                          <div
                            className="w-full px-4 py-3 font-mono text-xs transition-colors hover:bg-primary/10"
                            role="presentation"
                          >
                            <span className="text-destructive">
                              CRITICAL: Low Stock on {p.name} (Sisa: {p.stock})
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li>
                        <div
                          className="w-full px-4 py-3 font-mono text-xs transition-colors hover:bg-primary/10"
                          role="presentation"
                        >
                          <span className="text-emerald-500">
                            SYSTEM NOMINAL: All asset stocks are optimal.
                          </span>
                        </div>
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
