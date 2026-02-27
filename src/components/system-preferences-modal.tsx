"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Store,
  Shield,
  Upload,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface UserProfileForPrefs {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  storeName?: string;
}

interface SystemPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: UserProfileForPrefs;
  onSave?: (data: Partial<UserProfileForPrefs>) => void;
}

const NAV_TABS = [
  { id: "account", label: "ACCOUNT", icon: User },
  { id: "store", label: "STORE INFO", icon: Store },
  { id: "security", label: "SECURITY", icon: Shield },
] as const;

type TabLabel = (typeof NAV_TABS)[number]["label"];

const INITIAL_FORM_DATA = {
  username: "",
  email: "",
  storeName: "",
  businessType: "F&B / Retail",
  contactEmail: "",
  phone: "",
  address: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function SystemPreferencesModal({
  isOpen,
  onClose,
  currentProfile,
  onSave,
}: SystemPreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<TabLabel>("ACCOUNT");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSyncing, setIsSyncing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData((prev) => ({
        ...prev,
        username: currentProfile.name,
        email: currentProfile.email,
        storeName: currentProfile.storeName ?? prev.storeName,
      }));
      setAvatarUrl(currentProfile.avatar ?? "");
    }
  }, [isOpen, currentProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
      setAvatarUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarUrl && avatarUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarUrl);
    }
    setAvatarUrl("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onSave?.({
        name: formData.username,
        email: formData.email,
        avatar: avatarUrl || undefined,
        storeName: formData.storeName,
      });
      setIsSyncing(false);
      onClose();
    }, 1500);
  };

  const inputClass =
    "mt-1 w-full border-b-2 border-ink bg-white px-4 py-3 font-mono text-sm font-medium text-ink outline-none transition-colors focus:border-primary focus:ring-0 rounded-t-lg placeholder:text-gray-500 dark:border-white/10 dark:bg-surface-darker dark:text-white dark:placeholder:text-muted-foreground";

  function renderAccountTab() {
    return (
      <div className="space-y-6">
        <section className="rounded-md border border-gray-200 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-background/80">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-muted font-mono text-2xl font-semibold text-foreground">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  (formData.username
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0] ?? "")
                    .join("")
                    .toUpperCase() || "OP")
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-primary"
                aria-label="Upload avatar"
              >
                <Upload className="h-3.5 w-3.5 text-primary-foreground" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-ink dark:text-white">
                Avatar Settings
              </h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Upload a new avatar or synchronize with your Gravatar profile.
                Recommended size: 400×400px.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-sm bg-primary px-3 py-1.5 font-mono text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  UPLOAD NEW
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="rounded-md border border-red-200 px-4 py-2 font-mono text-xs font-bold text-red-600 transition-all hover:bg-red-50 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  REMOVE
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-md border border-gray-200 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-background/80">
          <h3 className="text-sm font-bold text-ink dark:text-white">
            Nexus ID Parameters
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 w-full border-b-2 border-ink bg-white py-2 font-mono text-sm font-medium text-ink outline-none transition-colors placeholder:text-gray-500 focus:border-primary dark:border-white/10 dark:bg-surface-darker dark:text-white dark:placeholder:text-muted-foreground"
                placeholder="Your display name"
              />
              <p className="mt-1 font-mono text-[10px] text-gray-600 dark:text-gray-400">
                Your public display name within the nexus network.
              </p>
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full border-b-2 border-ink bg-white py-2 font-mono text-sm font-medium text-ink outline-none transition-colors placeholder:text-gray-500 focus:border-primary dark:border-white/10 dark:bg-surface-darker dark:text-white dark:placeholder:text-muted-foreground"
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
          <h3 className="text-base font-bold uppercase tracking-wide text-ink dark:text-white">
            STORE CONFIGURATION
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Manage public-facing enterprise details.
          </p>
        </div>
        <section className="rounded-md border border-gray-200 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-background/80">
          <h4 className="text-sm font-bold text-ink dark:text-white">
            Enterprise Details
          </h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
          <h3 className="text-base font-bold uppercase tracking-wide text-ink dark:text-white">
            SECURITY PROTOCOLS
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Manage authentication and access credentials.
          </p>
        </div>
        <section className="rounded-md border border-gray-200 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-background/80">
          <h4 className="text-sm font-bold text-ink dark:text-white">
            Password Change
          </h4>
          <div className="mt-4 flex flex-col gap-6">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-colors peer-focus:text-primary dark:text-gray-400">
                CURRENT PASSWORD
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`peer ${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 cursor-pointer text-muted-foreground transition-colors hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-colors peer-focus:text-primary dark:text-gray-400">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`peer ${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 cursor-pointer text-muted-foreground transition-colors hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-colors peer-focus:text-primary dark:text-gray-400">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`peer ${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 cursor-pointer text-muted-foreground transition-colors hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="rounded-lg border border-gray-300 bg-gray-100 p-4 dark:border-white/20 dark:bg-surface-darker/50">
          <div className="flex gap-3">
            <Lock className="h-5 w-5 shrink-0 text-gray-500 dark:text-slate-400" />
            <div>
              <p className="font-mono text-xs font-bold text-gray-500 dark:text-slate-300">
                FEATURE_LOCKED // 2FA AUTENTIKASI
              </p>
              <p className="mt-1.5 text-[10px] text-gray-500 dark:text-slate-300">
                Sistem keamanan OTP dan biometrik sedang dalam tahap sinkronisasi jaringan. Fitur ini akan tersedia pada pembaruan sistem berikutnya.
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

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex h-[90vh] w-[95vw] max-h-screen max-w-4xl overflow-hidden rounded-md border-2 border-ink bg-white shadow-neo dark:border-red-500/20 dark:bg-[#0a0a0a] dark:shadow-[0_0_30px_rgba(255,0,0,0.1)] md:h-[600px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full w-full flex-col md:flex-row">
              {/* Menu Navigasi — Horizontal tabs di mobile, sidebar di desktop */}
              <aside className="flex flex-shrink-0 flex-row overflow-x-auto border-b border-ink/20 bg-gray-50 p-4 dark:border-white/10 dark:bg-surface-dark [&::-webkit-scrollbar]:hidden md:w-64 md:flex-col md:overflow-visible md:border-b-0 md:border-r-2 md:border-ink/20 md:p-0">
                <div className="hidden shrink-0 border-b border-ink/20 p-4 dark:border-white/10 md:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-white font-mono text-sm font-semibold text-ink dark:bg-muted dark:text-foreground">
                      SP
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-ink dark:text-foreground">
                        SYSTEM PREFS
                      </p>
                      <p className="font-mono text-[10px] text-gray-500 dark:text-muted-foreground">
                        V2.0.4 // ONLINE
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="flex gap-2 p-2 md:min-h-0 md:flex-1 md:flex-col md:space-y-0.5 md:overflow-y-auto">
                  {NAV_TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === label;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(label)}
                        className={cn(
                          "flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2.5 text-left text-sm font-bold transition-colors md:w-full md:gap-3 md:border-l-2",
                          isActive
                            ? "border-primary bg-ink text-white dark:bg-primary dark:text-primary-foreground md:border-l-primary"
                            : "border-transparent text-gray-600 hover:bg-gray-200 hover:text-ink dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white md:border-l-transparent"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    );
                  })}
                </nav>
                <div className="hidden shrink-0 border-t border-ink/20 p-3 font-mono text-[10px] text-gray-500 dark:border-white/10 dark:text-muted-foreground md:block">
                  <p>SERVER: US-EAST-1</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    CONNECTED
                  </p>
                </div>
              </aside>

              {/* Area Konten — flex-1, scroll independen */}
              <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper/50 dark:bg-muted/30">
                <div className="shrink-0 border-b border-ink/20 px-4 py-3 md:px-6 md:py-4 dark:border-white/10">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-0.5 shrink-0 bg-primary" />
                      <h2 className="text-base font-black uppercase tracking-wide text-ink dark:text-white md:text-lg">
                        USER PROFILE CONFIGURATION
                      </h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 rounded border border-primary/40 bg-white px-2 py-1 font-mono text-[10px] text-gray-500 dark:bg-background/80 dark:text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      ENCRYPTED CONNECTION
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {renderTabContent()}
                </div>

                {/* Footer Actions */}
                <div className="shrink-0 border-t border-ink/20 px-4 py-3 md:px-6 md:py-4 dark:border-white/10">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={onClose}
                      className="order-2 rounded-sm border-2 border-ink bg-white px-4 py-2 font-mono text-xs font-medium text-ink transition-colors hover:bg-gray-100 dark:border-white/20 dark:bg-background/80 dark:text-foreground dark:hover:bg-white/10 sm:order-1"
                    >
                      CANCEL CHANGES
                    </button>
                    <button
                      type="button"
                      onClick={handleSyncData}
                      disabled={isSyncing}
                      className="order-1 flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2 font-mono text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:order-2"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
                      {isSyncing ? "UPLOADING..." : "SYNC DATA"}
                    </button>
                  </div>
                </div>
              </main>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
