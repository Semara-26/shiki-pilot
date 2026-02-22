"use client";

import { useState } from "react";
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

interface OperatorIdPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OperatorIdPanel({ isOpen, onClose }: OperatorIdPanelProps) {
  const [interfaceModeOn, setInterfaceModeOn] = useState(true);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-[80px] z-[100] w-[320px] overflow-hidden rounded-md border border-primary bg-background/95 shadow-[0_0_15px_rgba(242,13,13,0.3)] backdrop-blur-md"
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
            <div className="relative border-b border-primary/50 px-4 pb-4 pt-5">
              <span className="absolute left-0 top-0 rounded-r bg-primary px-2 py-0.5 font-mono text-[10px] font-medium text-primary-foreground">
                OP-01
              </span>
              <span className="absolute right-4 top-4 font-mono text-primary">
                #
              </span>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-muted font-mono text-sm font-semibold text-foreground">
                  AR
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-semibold leading-tight text-foreground">
                    ADMIN RAJA TUNA
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                    ROLE // SYSTEM_OPERATOR
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-foreground/90">ONLINE</span>
                    <span>// SECURE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu List */}
            <ul className="border-b border-primary/30">
              <li>
                <button
                  type="button"
                  onClick={() => setIsPrefsOpen(true)}
                  className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-white/5 hover:border-l-primary"
                >
                  <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      SYSTEM PREFERENCES
                    </p>
                    <p className="font-mono text-[10px] text-primary">
                      CONFIG_SYS_01
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-white/5 hover:border-l-primary"
                >
                  <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      INTERFACE MODE
                    </p>
                    <p className="font-mono text-[10px] text-primary">
                      HUD_OVERLAY_V2
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={interfaceModeOn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInterfaceModeOn((v) => !v);
                    }}
                    className="relative h-6 w-11 shrink-0 rounded-sm bg-primary transition-colors"
                  >
                    <span className="absolute inset-y-0 left-1.5 flex items-center font-mono text-[10px] font-medium text-primary-foreground">
                      {interfaceModeOn ? "ON" : "OFF"}
                    </span>
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-sm bg-white transition-all",
                        interfaceModeOn ? "right-0.5" : "left-0.5"
                      )}
                    />
                  </button>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-white/5 hover:border-l-primary"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      DOCUMENTATION
                    </p>
                    <p className="font-mono text-[10px] text-primary">
                      READ_MANUAL_0X
                    </p>
                  </div>
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            </ul>

            {/* Footer — Danger Zone */}
            <div className="p-4">
              <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/50 bg-background/80 py-3 font-mono text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Power className="h-4 w-4" />
                TERMINATE SESSION
              </button>
            </div>

            {/* Bottom info bar */}
            <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 font-mono text-[10px] text-muted-foreground">
              <span>ID: 803-212-AF</span>
              <span>NERV.08_VER.3.33</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      <SystemPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </>
  );
}
