"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Calendar } from "lucide-react";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlId = searchParams.get("id") || "";
  const urlStart = searchParams.get("start") || "";
  const urlEnd = searchParams.get("end") || "";

  const [id, setId] = useState(urlId);
  const [start, setStart] = useState(urlStart);
  const [end, setEnd] = useState(urlEnd);

  const [prevUrl, setPrevUrl] = useState({ id: urlId, start: urlStart, end: urlEnd });

  if (urlId !== prevUrl.id || urlStart !== prevUrl.start || urlEnd !== prevUrl.end) {
    setId(urlId);
    setStart(urlStart);
    setEnd(urlEnd);
    setPrevUrl({ id: urlId, start: urlStart, end: urlEnd });
  }

  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams);
    
    if (id.trim()) params.set("id", id);
    else params.delete("id");

    if (start) params.set("start", start);
    else params.delete("start");

    if (end) params.set("end", end);
    else params.delete("end");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setId("");
    setStart("");
    setEnd("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 rounded-md border border-ink/20 bg-card p-4 dark:border-white/10 dark:bg-surface-dark w-full shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end w-full">
        {/* Input ID Transaksi */}
        <div className="flex-1 w-full">
          <label htmlFor="tx-id" className="block mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            ID TRANSAKSI
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="tx-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Cari parsial ID..."
              className="h-9 w-full rounded-md border border-ink/20 bg-background px-9 py-2 font-mono text-sm text-ink placeholder:text-gray-500 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-background/50 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </div>
        
        {/* Input Tanggal Mulai */}
        <div className="flex-1 w-full sm:max-w-40">
           <label htmlFor="tx-start" className="block mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            START DATE
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
             <input
              id="tx-start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="h-9 w-full rounded-md border border-ink/20 bg-background pl-9 pr-3 py-2 font-mono text-xs text-ink transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-background/50 dark:text-white"
            />
          </div>
        </div>

        {/* Input Tanggal Akhir */}
        <div className="flex-1 w-full sm:max-w-40">
           <label htmlFor="tx-end" className="block mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            END DATE
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
             <input
              id="tx-end"
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
              className="h-9 w-full rounded-md border border-ink/20 bg-background pl-9 pr-3 py-2 font-mono text-xs text-ink transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-background/50 dark:text-white"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {(id || start || end || searchParams.toString()) && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-3 rounded font-mono text-xs font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
            >
              CLEAR
            </button>
          )}
          <button
            type="button"
            onClick={handleApplyFilter}
            className="h-9 rounded-md shrink-0 bg-primary px-4 font-mono text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            APPLY FILTER
          </button>
        </div>
      </div>
    </div>
  );
}
