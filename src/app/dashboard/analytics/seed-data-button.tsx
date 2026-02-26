"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { seedDummyTransactions } from "@/src/lib/actions/transaction";

interface SeedDataButtonProps {
  storeId: string;
}

export function SeedDataButton({ storeId }: SeedDataButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await seedDummyTransactions(storeId);
      if (result.success) {
        toast.success("Seed data berhasil", {
          description: `${result.count} transaksi dummy telah ditambahkan.`,
        });
        router.refresh();
      } else {
        toast.error("Gagal inject seed data", { description: result.error });
      }
    } catch {
      toast.error("Gagal inject seed data", { description: "Terjadi kesalahan." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-1.5 rounded border border-amber-500/60 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-amber-600 transition-colors hover:bg-amber-500/20 disabled:opacity-50 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : null}
      DEV: Inject Seed Data
    </button>
  );
}
