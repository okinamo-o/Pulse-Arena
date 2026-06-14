"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MatchReminder {
  matchId: string;
  title: string;
  date: number;
  createdAt: number;
}

interface RemindersState {
  reminders: MatchReminder[];
  dismissedIds: string[];
  addReminder: (reminder: Omit<MatchReminder, "createdAt">) => void;
  removeReminder: (matchId: string) => void;
  dismissReminder: (matchId: string) => void;
  hasReminder: (matchId: string) => boolean;
}

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set, get) => ({
      reminders: [],
      dismissedIds: [],
      addReminder: (reminder) =>
        set((state) => ({
          reminders: state.reminders.some((item) => item.matchId === reminder.matchId)
            ? state.reminders
            : [...state.reminders, { ...reminder, createdAt: Date.now() }]
        })),
      removeReminder: (matchId) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.matchId !== matchId),
          dismissedIds: state.dismissedIds.filter((id) => id !== matchId)
        })),
      dismissReminder: (matchId) =>
        set((state) => ({
          dismissedIds: state.dismissedIds.includes(matchId) ? state.dismissedIds : [...state.dismissedIds, matchId]
        })),
      hasReminder: (matchId) => get().reminders.some((reminder) => reminder.matchId === matchId)
    }),
    {
      name: "pulse-arena-reminders"
    }
  )
);
