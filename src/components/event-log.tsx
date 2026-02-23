"use client";

import { Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface EventLogItem {
  id: string;
  title: string;
  detail?: string;
  /** Tampilan lama: string waktu saja. Lebih baik gunakan date (ISO) agar diformat "DD MMM • HH:mm". */
  timestamp?: string;
  /** ISO date string (atau Date yang diserialisasi) untuk format "22 Feb • 13:45". */
  date?: string;
  type?: "order" | "stock" | "system" | "default";
}

/** Format: "22 Feb • 13:45" (DD MMM • HH:mm). */
function formatEventDate(dateInput: string | Date | undefined): string {
  if (dateInput == null) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} • ${hour}:${min}`;
}

interface EventLogProps {
  events: EventLogItem[];
  title?: string;
  maxItems?: number;
  className?: string;
}

export function EventLog({
  events,
  title = "EVENT LOG",
  maxItems = 8,
  className,
}: EventLogProps) {
  const displayEvents = events.slice(0, maxItems);

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-ink bg-white dark:border-white/10 dark:bg-surface-dark",
        className
      )}
    >
      <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
        <p className="text-sm font-bold uppercase tracking-widest text-ink dark:text-white">
          {title}
        </p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-white/5">
        {displayEvents.map((event) => (
          <li
            key={event.id}
            className="flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <div className="flex min-w-[7rem] shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono leading-tight">
                {event.date != null
                  ? formatEventDate(event.date)
                  : event.timestamp ?? "—"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink dark:text-white">
                {event.title}
              </p>
              {event.detail && (
                <p className="mt-0.5 truncate text-sm font-medium text-gray-600 dark:text-gray-400">
                  {event.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
