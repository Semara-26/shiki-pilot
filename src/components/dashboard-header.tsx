"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

interface DashboardHeaderProps {
  breadcrumbs?: string;
  title?: string;
  className?: string;
}

const STATIC_NOTIFICATIONS = [
  { id: "1", type: "critical" as const, text: "CRITICAL: Low Stock on Kerupuk Pedas" },
  { id: "2", type: "success" as const, text: "SUCCESS: Asset registry synced" },
];

export function DashboardHeader({
  breadcrumbs = "TERMINAL / ACTIVE PROJECTS",
  title = "DATA REPOSITORY",
  className,
}: DashboardHeaderProps) {
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
        "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {breadcrumbs}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-48 rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
              aria-expanded={isNotifOpen}
            >
              <Bell className="h-4 w-4" />
              <span
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary animate-pulse"
                aria-hidden
              />
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
                    {STATIC_NOTIFICATIONS.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left font-mono text-xs transition-colors hover:bg-primary/10"
                        >
                          <span
                            className={cn(
                              item.type === "critical" && "text-destructive",
                              item.type === "success" && "text-emerald-500"
                            )}
                          >
                            {item.text}
                          </span>
                        </button>
                      </li>
                    ))}
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
