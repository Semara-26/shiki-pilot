"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Store,
  Shield,
  Upload,
  Lock,
  RefreshCw,
  AlertTriangle,
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
] as const;

type TabLabel = (typeof NAV_TABS)[number]["label"];

const INITIAL_FORM_DATA = {
  username: "Kael_V",
  email: "kael@nexus-systems.com",
  storeName: "Raja Tuna",
  businessType: "F&B / Retail",
  contactEmail: "hello@rajatuna.com",
  phone: "+62 812-3456-7890",
  address: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function SystemPreferencesModal({
  isOpen,
  onClose,
}: SystemPreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<TabLabel>("ACCOUNT");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onClose();
    }, 1500);
  };

  const inputClass =
    "mt-1 w-full border-0 border-b-2 border-white/10 bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-0 rounded-t-lg placeholder:text-muted-foreground";

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
                id="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
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
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
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
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wide text-foreground">
            STORE CONFIGURATION
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage public-facing enterprise details.
          </p>
        </div>
        <section className="rounded-md border border-white/10 bg-background/80 p-4">
          <h4 className="text-sm font-semibold text-foreground">
            Enterprise Details
          </h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                STORE NAME
              </label>
              <input
                id="storeName"
                type="text"
                value={formData.storeName}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Store name"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                BUSINESS TYPE
              </label>
              <select
                id="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="F&B / Retail" className="text-black dark:text-white">F&B / Retail</option>
                <option value="Services" className="text-black dark:text-white">Services</option>
                <option value="Manufacturing" className="text-black dark:text-white">Manufacturing</option>
                <option value="Other" className="text-black dark:text-white">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                CONTACT EMAIL
              </label>
              <input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="hello@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                PHONE NUMBER
              </label>
              <input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="+62 812-3456-7890"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                STORE ADDRESS
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`${inputClass} min-h-[80px] resize-y`}
                placeholder="Full address"
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderSecurityTab() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wide text-foreground">
            SECURITY PROTOCOLS
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage authentication and access credentials.
          </p>
        </div>
        <section className="rounded-md border border-white/10 bg-background/80 p-4">
          <h4 className="text-sm font-semibold text-foreground">
            Password Change
          </h4>
          <div className="mt-4 flex flex-col gap-6">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors peer-focus:text-primary">
                CURRENT PASSWORD
              </label>
              <input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`peer ${inputClass}`}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors peer-focus:text-primary">
                NEW PASSWORD
              </label>
              <input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`peer ${inputClass}`}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors peer-focus:text-primary">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`peer ${inputClass}`}
                placeholder="••••••••"
              />
            </div>
          </div>
        </section>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
            <div>
              <p className="font-semibold text-yellow-600 dark:text-yellow-500">
                Two-Factor Authentication Required
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Changes to sensitive account data require a secondary
                authentication token. Ensure your bio-link or keyfob is active.
              </p>
            </div>
          </div>
        </div>
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
                    onClick={handleSyncData}
                    disabled={isSyncing}
                    className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2 font-mono text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
                    {isSyncing ? "UPLOADING..." : "SYNC DATA"}
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
