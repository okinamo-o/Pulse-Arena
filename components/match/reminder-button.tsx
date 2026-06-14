"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StreamedMatch } from "@/lib/streamed/types";
import { useRemindersStore } from "@/store/reminders-store";

export function ReminderButton({ match, compact = false }: { match: StreamedMatch; compact?: boolean }) {
  const hasReminder = useRemindersStore((state) => state.hasReminder(match.id));
  const addReminder = useRemindersStore((state) => state.addReminder);
  const removeReminder = useRemindersStore((state) => state.removeReminder);

  return (
    <Button
      type="button"
      variant={hasReminder ? "orange" : "secondary"}
      size={compact ? "icon" : "default"}
      aria-pressed={hasReminder}
      aria-label={hasReminder ? `Remove reminder for ${match.title}` : `Set reminder for ${match.title}`}
      onClick={(event) => {
        event.preventDefault();
        if (hasReminder) removeReminder(match.id);
        else addReminder({ matchId: match.id, title: match.title, date: match.date });
      }}
    >
      {hasReminder ? <BellOff className="h-4 w-4" aria-hidden="true" /> : <Bell className="h-4 w-4" aria-hidden="true" />}
      {compact ? null : hasReminder ? "Reminder on" : "Remind me"}
    </Button>
  );
}
