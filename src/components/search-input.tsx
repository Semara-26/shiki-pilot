"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
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
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    // Sinkronisasi value jika berubah dari URL (e.g. back navigation)
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const currentQ = params.get("q") || "";
      
      // Cegah update routing infinite loop 
      if (currentQ === query) return;

      if (query.trim() === "") {
        params.delete("q");
      } else {
        params.set("q", query);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [query, router, pathname, searchParams, debounceTime]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full sm:w-64 md:w-80 rounded-md border border-ink/20 bg-white px-9 py-2 text-sm font-mono text-ink placeholder:text-gray-500 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-surface-dark dark:text-white dark:placeholder:text-gray-400"
      />
    </div>
  );
}
