"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TERMINAL_LINES = [
  "> INITIALIZING CORE SYSTEM... OK.",
  "> ASSET REPOSITORY: Monitors real-time stock levels.",
  "> AI CO-PILOT: Neural network for data querying.",
  "> SYSTEM PREFERENCES: Manage operator identity and enterprise configuration.",
  "> WARNING: Unauthorized modification of system parameters will result in immediate session termination.",
];

export function DocumentationModal({
  isOpen,
  onClose,
}: DocumentationModalProps) {
  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex h-[500px] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-primary bg-white shadow-[0_0_25px_rgba(242,13,13,0.25)] dark:bg-[#0a0a0a]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-primary/50 px-6 py-4">
              <BookOpen className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">
                CLASSIFIED // SHIKIPILOT OPERATIONAL MANUAL
              </h2>
            </div>

            {/* Scrollable terminal content */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-4">
              <pre className="max-w-full font-mono text-sm text-emerald-700 whitespace-pre-wrap break-words dark:text-emerald-500">
                {TERMINAL_LINES.map((line, i) => (
                  <span key={i}>
                    {line}
                    {"\n"}
                  </span>
                ))}
              </pre>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-primary/30 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-md border border-primary bg-white py-3 font-mono text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground dark:bg-black"
              >
                CLOSE MANUAL
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
