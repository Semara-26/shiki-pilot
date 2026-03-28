import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface LowStockAlertProps {
  products: LowStockProduct[];
  className?: string;
}

export function LowStockAlert({ products, className }: LowStockAlertProps) {
  const isSafe = products.length === 0;

  if (isSafe) {
    return (
      <div className={cn("flex items-center gap-3 rounded-md px-4 py-3 bg-zinc-900/40 border border-emerald-500/20 shadow-sm", className)}>
        <CheckCircle2 className="h-4 w-4 text-emerald-500/80 shrink-0" />
        <p className="font-mono text-xs tracking-wide text-gray-400">
          SYSTEM NOMINAL: Seluruh persediaan aset berada pada jumlah optimal.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-md px-4 py-3 bg-amber-950/30 border border-amber-500/50 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
        <p className="font-mono text-xs font-semibold tracking-wide text-amber-400">
          WARNING: {products.length} aset hampir habis. Segera lakukan restock.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1"
          >
            <span className="font-mono text-[10px] text-amber-200/90 truncate max-w-[150px]" title={product.name}>
              {product.name}
            </span>
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-sm bg-amber-500 px-1.5 font-mono text-[10px] font-bold text-amber-950">
              {product.stock}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
