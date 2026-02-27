"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { processAiImport } from "@/src/lib/actions/product";

export function AiImportButton() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExtract = async () => {
    if (!importText.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await processAiImport(importText);
      if (result.success) {
        setImportText("");
        setIsModalOpen(false);
        toast.success("Import berhasil", {
          description: `${result.count} produk telah disimpan ke inventori.`,
        });
        router.refresh();
      } else {
        toast.error("Import gagal", { description: result.error });
      }
    } catch {
      toast.error("Import gagal", { description: "Terjadi kesalahan." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (!isProcessing) {
      setImportText("");
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary/10 px-4 py-2.5 font-mono text-sm font-bold text-primary transition-colors hover:bg-primary/20 hover:border-primary dark:border-[#22d3ee] dark:bg-[#22d3ee]/10 dark:text-[#22d3ee] dark:hover:bg-[#22d3ee]/20 dark:hover:border-[#22d3ee]"
      >
        ✨ Import Cepat (AI)
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleCancel}
          aria-hidden
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-md border-2 border-ink bg-ink shadow-neo dark:border-[#22d3ee]/50 dark:bg-[#0a0a0a] dark:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b-2 border-white/20 px-6 py-4">
              <h2 className="font-mono text-lg font-black uppercase tracking-wider text-white">
                ✨ Import Data via AI
              </h2>
            </div>

            {/* Body */}
            <div className="space-y-4 p-6">
              <p className="font-mono text-xs text-gray-400">
                Ketik atau paste daftar barang dari WhatsApp di sini. Format bebas
                (misal: Kerupuk pedas 15rb stok 50). AI kami akan merapikannya.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                className="h-64 w-full resize-none rounded-md border-2 border-white/20 bg-transparent p-4 font-mono text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none dark:border-white/20 dark:focus:border-[#22d3ee]"
                placeholder="Contoh:
Kerupuk Tuna Pedas 20.000
Kerupuk Bawang 17rb stok 50
Kopi Susu harganya 5000"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t-2 border-white/20 px-6 py-4">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border-2 border-white/30 bg-transparent px-4 py-2 font-mono text-sm font-medium text-white transition-colors hover:bg-white/10 dark:border-white/20"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExtract}
                disabled={isProcessing || !importText.trim()}
                className="inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary px-4 py-2 font-mono text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed dark:border-[#22d3ee] dark:bg-[#22d3ee] dark:text-[#0a0a0a] dark:hover:bg-[#22d3ee]/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses AI...
                  </>
                ) : (
                  "✨ Ekstrak & Simpan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
