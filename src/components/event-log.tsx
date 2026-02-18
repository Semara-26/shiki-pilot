"use client";

import { Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface EventLogItem {
  id: string;
  title: string;
  detail?: string;
  timestamp: string;
  type?: "order" | "stock" | "system" | "default";
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
        "rounded-md border border-border bg-card text-card-foreground",
        className
      )}
    >
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      </div>
      <ul className="divide-y divide-border">
        {displayEvents.map((event) => (
          <li
            key={event.id}
            className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{event.timestamp}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {event.title}
              </p>
              {event.detail && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
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
