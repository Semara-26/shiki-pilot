"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="bg-white dark:bg-[#0a0a0a] border-2 border-ink dark:border-red-500/50 shadow-neo dark:shadow-[0_0_30px_rgba(255,0,0,0.2)] max-w-md w-full p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="confirm-delete-title"
              className="text-red-600 font-black text-xl mb-4 font-mono uppercase tracking-wider"
            >
              WARNING // DATA DELETION
            </h2>
            <p className="text-ink dark:text-gray-300 font-medium mb-6 font-mono text-sm">
              Tindakan ini akan menghapus aset dari repositori secara permanen.
              Lanjutkan?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 border-2 border-ink dark:border-white/20 text-ink dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors rounded-md disabled:opacity-50 disabled:pointer-events-none font-mono text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white font-bold border-2 border-ink dark:border-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 rounded-md disabled:opacity-70 disabled:pointer-events-none font-mono text-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
