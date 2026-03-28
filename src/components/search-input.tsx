"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  debounceTime?: number;
}

export function SearchInput({
  placeholder = "Cari aset...",
  className,
  debounceTime = 300,
}: SearchInputProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [prevUrlQuery, setPrevUrlQuery] = useState(searchParams.get("q") || "");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref untuk snapshot searchParams saat ini tanpa memicu re-render atau dependency
  const searchParamsRef = useRef(searchParams);

  const urlQuery = searchParams.get("q") || "";

  // Update ref setelah render selesai agar Effect #3 selalu baca nilai terbaru
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });

  // 1. Sinkronisasi dengan URL eksternal (mis. Back Button browser ditekan)
  if (urlQuery !== prevUrlQuery) {
    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
    setPrevUrlQuery(urlQuery);
  }

  // 2. Timer Debounce murni berjalan pada local state
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceTime);

    // Kritis: batalkan timer apabila user kembali mengetik sebelum waktu habis
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceTime]);

  // 3. Eksekusi perpindahan parameter URL HANYA ketika debounce tuntas.
  // Menggunakan searchParamsRef (bukan searchParams langsung) agar tidak perlu
  // memasukkan searchParams ke dependency array dan memicu request ganda.
  useEffect(() => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    const currentQ = params.get("q") || "";

    // Guard: batalkan jika nilai sudah sinkron (cegah request ganda)
    if (currentQ === debouncedQuery) return;

    if (debouncedQuery.trim() === "") {
      params.delete("q");
    } else {
      params.set("q", debouncedQuery);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [debouncedQuery, pathname, router]); // searchParamsRef selalu fresh, aman tanpa di-dependency

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timerRef.current) clearTimeout(timerRef.current);
      setDebouncedQuery(query); // Bypass timer, langsung eksekusi
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left icon: spinner saat loading, search saat idle */}
      {isPending ? (
        <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
      ) : (
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
      )}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full sm:w-64 md:w-80 rounded-md border px-9 py-2 text-sm font-mono text-ink placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-1 dark:text-white dark:placeholder:text-gray-400 bg-white dark:bg-surface-dark",
          isPending
            ? "border-primary/50 focus:border-primary focus:ring-primary opacity-80"
            : "border-ink/20 focus:border-primary focus:ring-primary dark:border-white/10"
        )}
      />
    </div>
  );
}
