"use client";

import * as React from "react";
import { Bell, X } from "lucide-react";
import { useRemindersStore } from "@/store/reminders-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function ReminderEngine() {
  const reminders = useRemindersStore((state) => state.reminders);
  const dismissedIds = useRemindersStore((state) => state.dismissedIds);
  const dismissReminder = useRemindersStore((state) => state.dismissReminder);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const due = reminders.find((reminder) => {
    const minutesUntil = (reminder.date - now) / 60000;
    return minutesUntil <= 15 && minutesUntil >= -10 && !dismissedIds.includes(reminder.matchId);
  });

  if (!due) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-24 right-4 z-50 w-[min(calc(100vw-2rem),390px)] rounded-xl border border-signal-lime/35 bg-graphite-900/92 p-4 shadow-glow backdrop-blur-2xl md:bottom-6"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-lime text-graphite-950">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal-lime">Reminder armed</p>
          <p className="mt-1 text-sm font-semibold text-white">{due.title}</p>
          <p className="mt-1 text-xs text-white/58">Kickoff window is open. Streams are ready when available.</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Dismiss reminder"
          onClick={() => dismissReminder(due.matchId)}
          className="h-9 w-9"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
