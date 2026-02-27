"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  Settings,
  Monitor,
  FileText,
  Power,
  ChevronRight,
  Link2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { SystemPreferencesModal } from "@/src/components/system-preferences-modal";
import { DocumentationModal } from "@/src/components/documentation-modal";

const ROLE_LABEL = "ROLE // SYSTEM_OPERATOR";
const MAX_NAME_LENGTH = 24;

function truncateWithEllipsis(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 3)}...`;
}

interface OperatorIdPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OperatorIdPanel({ isOpen, onClose }: OperatorIdPanelProps) {
  const { theme, setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Partial<{
    name: string;
    email: string;
    avatar: string;
    storeName: string;
  }>>({});

  const userProfile = useMemo(() => {
    const baseName = user?.fullName ?? "SYSTEM_OPERATOR";
    const baseEmail = user?.primaryEmailAddress?.emailAddress ?? "";
    const baseAvatar = user?.imageUrl ?? "";
    return {
      name: localOverrides.name ?? baseName,
      email: localOverrides.email ?? baseEmail,
      role: ROLE_LABEL,
      avatar: localOverrides.avatar ?? baseAvatar,
      storeName: localOverrides.storeName ?? "",
    };
  }, [user?.fullName, user?.primaryEmailAddress?.emailAddress, user?.imageUrl, localOverrides]);

  const isDark = theme !== "light";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const nameForInitials = localOverrides.name ?? user?.fullName ?? "SYSTEM_OPERATOR";
  const initials = nameForInitials
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "OP";

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-4 left-4 z-[100] w-[320px] max-h-[calc(100vh-3rem)] overflow-y-auto rounded-md border-2 border-ink bg-white shadow-neo backdrop-blur-md dark:border-red-500/30 dark:bg-surface-dark dark:shadow-none origin-bottom-left md:left-[272px]"
      >
          {/* Scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.15) 2px,
                rgba(255,255,255,0.15) 4px
              )`,
            }}
            aria-hidden
          />

          <div className="relative z-10">
            {/* Header — ID Card */}
            <div className="relative border-b border-ink/30 px-4 pb-4 pt-5 dark:border-primary/50">
              <span className="absolute left-0 top-0 rounded-r bg-primary px-2 py-0.5 font-mono text-[10px] font-medium text-primary-foreground">
                OP-01
              </span>
              <span className="absolute right-4 top-4 font-mono text-primary">
                #
              </span>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-paper font-mono text-sm font-semibold text-ink dark:bg-muted dark:text-foreground">
                  {!isLoaded ? (
                    <span className="h-4 w-4 animate-pulse rounded bg-gray-300 dark:bg-white/20" />
                  ) : userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  {!isLoaded ? (
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-white/20" />
                  ) : (
                    <p
                      className="font-black leading-tight text-ink dark:text-white truncate"
                      title={userProfile.name}
                    >
                      {truncateWithEllipsis(userProfile.name, MAX_NAME_LENGTH)}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                    {userProfile.role}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-gray-500 dark:text-muted-foreground">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-ink/90 dark:text-foreground/90">ONLINE</span>
                    <span>// SECURE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu List */}
            <ul className="border-b border-ink/20 dark:border-primary/30">
              <li>
                <button
                  type="button"
                  onClick={() => setIsPrefsOpen(true)}
                  className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-gray-100 hover:border-l-primary dark:hover:bg-white/5 dark:hover:border-l-primary"
                >
                  <Settings className="h-4 w-4 shrink-0 text-gray-500 dark:text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink dark:text-white">
                      SYSTEM PREFERENCES
                    </p>
                    <p className="font-mono text-[10px] text-primary">
                      CONFIG_SYS_01
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-500 dark:text-muted-foreground" />
                </button>
              </li>
              <li>
                <div
                  role="menuitem"
                  tabIndex={0}
                  onClick={toggleTheme}
                  className="flex w-full cursor-pointer items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/5 hover:border-l-primary dark:hover:border-l-primary"
                >
                  <Monitor className="h-4 w-4 shrink-0 text-gray-500 dark:text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink dark:text-white">
                      INTERFACE MODE
                    </p>
                    <p className="font-mono text-[10px] text-primary">
                      HUD_OVERLAY_V2
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "font-mono text-[10px] font-bold",
                        isDark ? "text-primary" : "text-slate-500"
                      )}
                    >
                      {isDark ? "DARK" : "LIGHT"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isDark}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                      }}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-sm transition-colors",
                        isDark ? "bg-primary" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-4 w-4 rounded-sm bg-white transition-transform",
                          isDark && "translate-x-5"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsDocOpen(true)}
                  className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/5 hover:border-l-primary dark:hover:border-l-primary"
                >
                  <FileText className="h-4 w-4 shrink-0 text-gray-500 dark:text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink dark:text-white">
                      DOCUMENTATION
                    </p>
                    <p className="font-mono text-[10px] text-primary">
                      READ_MANUAL_0X
                    </p>
                  </div>
                  <Link2 className="h-4 w-4 shrink-0 text-gray-500 dark:text-muted-foreground" />
                </button>
              </li>
            </ul>

            {/* Footer — Danger Zone */}
            <div className="p-4">
              <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-ink bg-white py-3 font-mono text-sm font-semibold text-primary transition-colors hover:bg-red-50 dark:border-primary/50 dark:bg-transparent dark:hover:bg-primary dark:hover:text-primary-foreground"
              >
                <Power className="h-4 w-4" />
                TERMINATE SESSION
              </button>
            </div>

            {/* Bottom info bar */}
            <div className="flex items-center justify-between border-t border-ink/20 px-4 py-2 font-mono text-[10px] text-gray-500 dark:border-border/50 dark:text-muted-foreground">
              <span>ID: 803-212-AF</span>
              <span>NERV.08_VER.3.33</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {typeof document !== "undefined" &&
        createPortal(panelContent, document.body)}

      <SystemPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
        currentProfile={userProfile}
        onSave={(newData) =>
          setLocalOverrides((prev) => ({ ...prev, ...newData }))
        }
      />
      <DocumentationModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
      />
    </>
  );
}
