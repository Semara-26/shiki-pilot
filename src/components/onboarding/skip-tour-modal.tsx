"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SkipTourModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SkipTourModal({ isOpen, onCancel, onConfirm }: SkipTourModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000000000] flex items-center justify-center !pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm !pointer-events-auto"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 !pointer-events-auto"
          >
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Lewati Panduan?
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Apakah Anda yakin ingin melewati sisa panduan ini? Anda dapat mengulangnya kembali nanti melalui ikon bantuan di menu atas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors !pointer-events-auto relative z-10"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors !pointer-events-auto relative z-10"
              >
                Ya, Lewati
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
