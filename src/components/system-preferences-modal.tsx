"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Store,
  Shield,
  Key,
  Upload,
  Lock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SystemPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_TABS = [
  { id: "account", label: "ACCOUNT", icon: User },
  { id: "store", label: "STORE INFO", icon: Store },
  { id: "security", label: "SECURITY", icon: Shield },
  { id: "api", label: "API KEYS", icon: Key },
] as const;

type TabLabel = (typeof NAV_TABS)[number]["label"];

export function SystemPreferencesModal({
  isOpen,
  onClose,
}: SystemPreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<TabLabel>("ACCOUNT");
  const [username, setUsername] = useState("Kael_V");
  const [email, setEmail] = useState("kael@nexus-systems.com");

  function renderAccountTab() {
    return (
      <div className="space-y-6">
        <section className="rounded-md border border-white/10 bg-background/80 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-muted font-mono text-2xl font-semibold text-foreground">
                KV
              </div>
              <button
                type="button"
                className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-primary"
                aria-label="Upload avatar"
              >
                <Upload className="h-3.5 w-3.5 text-primary-foreground" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                Avatar Settings
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a new avatar or synchronize with your Gravatar profile.
                Recommended size: 400×400px.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-sm bg-primary px-3 py-1.5 font-mono text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  UPLOAD NEW
                </button>
                <button
                  type="button"
                  className="rounded-sm border border-primary/60 bg-transparent px-3 py-1.5 font-mono text-xs text-foreground transition-colors hover:bg-primary/10"
                >
                  REMOVE
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-md border border-white/10 bg-background/80 p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Nexus ID Parameters
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full border-b border-white/20 bg-transparent py-2 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder="Your display name"
              />
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Your public display name within the nexus network.
              </p>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border-b border-white/20 bg-transparent py-2 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderStoreInfoTab() {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="font-mono text-sm text-muted-foreground">
          STORE_INFO_MODULE // INITIALIZING...
        </p>
      </div>
    );
  }

  function renderSecurityTab() {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="font-mono text-sm text-muted-foreground">
          SECURITY_PROTOCOL // STANDBY...
        </p>
      </div>
    );
  }

  function renderApiKeysTab() {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="font-mono text-sm text-muted-foreground">
          API_GATEWAY // OFFLINE...
        </p>
      </div>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case "ACCOUNT":
        return renderAccountTab();
      case "STORE INFO":
        return renderStoreInfoTab();
      case "SECURITY":
        return renderSecurityTab();
      case "API KEYS":
        return renderApiKeysTab();
      default:
        return renderAccountTab();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex h-[600px] max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-md border border-primary bg-background shadow-[0_0_25px_rgba(242,13,13,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kolom Kiri — Navigasi */}
            <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-background/98">
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-muted font-mono text-sm font-semibold text-foreground">
                    SP
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                      SYSTEM PREFS
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      V2.0.4 // ONLINE
                    </p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 space-y-0.5 p-2">
                {NAV_TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === label;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-sm border-l-2 px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        isActive
                          ? "border-primary bg-primary/90 text-primary-foreground"
                          : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-white/10 p-3 font-mono text-[10px] text-muted-foreground">
                <p>SERVER: US-EAST-1</p>
                <p className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  CONNECTED
                </p>
              </div>
            </aside>

            {/* Kolom Kanan — Konten (Modular Grid) */}
            <main className="flex flex-1 flex-col overflow-y-auto bg-muted/30">
              <div className="shrink-0 border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-0.5 bg-primary" />
                    <h2 className="text-lg font-semibold uppercase tracking-wide text-foreground">
                      USER PROFILE CONFIGURATION
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 rounded border border-primary/40 bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    ENCRYPTED CONNECTION
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {renderTabContent()}
              </div>

              {/* Footer Actions */}
              <div className="shrink-0 border-t border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-sm border border-white/20 bg-background/80 px-4 py-2 font-mono text-xs font-medium text-foreground transition-colors hover:bg-white/10"
                  >
                    CANCEL CHANGES
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2 font-mono text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    SYNC DATA
                  </button>
                </div>
              </div>
            </main>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
