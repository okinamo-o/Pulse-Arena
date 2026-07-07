"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "./idb-storage";

interface PreferencesState {
  reducedMotion: boolean;
  selectedSport?: string;
  recentSearches: string[];
  setReducedMotion: (value: boolean) => void;
  setSelectedSport: (sport?: string) => void;
  pushRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      selectedSport: undefined,
      recentSearches: [],
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setSelectedSport: (sport) => set({ selectedSport: sport }),
      pushRecentSearch: (query) =>
        set((state) => {
          const clean = query.trim();
          if (!clean) return state;
          return { recentSearches: [clean, ...state.recentSearches.filter((item) => item !== clean)].slice(0, 8) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] })
    }),
    {
      name: "pulse-arena-preferences",
      storage: createJSONStorage(() => idbStorage)
    }
  )
);
