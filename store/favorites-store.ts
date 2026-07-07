"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "./idb-storage";

interface FavoritesState {
  favoriteMatchIds: string[];
  favoriteTeams: string[];
  favoriteSports: string[];
  toggleMatch: (id: string) => void;
  toggleTeam: (team: string) => void;
  toggleSport: (sport: string) => void;
  isMatchFavorite: (id: string) => boolean;
  isTeamFavorite: (team: string) => boolean;
  isSportFavorite: (sport: string) => boolean;
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteMatchIds: [],
      favoriteTeams: [],
      favoriteSports: [],
      toggleMatch: (id) => set((state) => ({ favoriteMatchIds: toggleValue(state.favoriteMatchIds, id) })),
      toggleTeam: (team) => set((state) => ({ favoriteTeams: toggleValue(state.favoriteTeams, team) })),
      toggleSport: (sport) => set((state) => ({ favoriteSports: toggleValue(state.favoriteSports, sport) })),
      isMatchFavorite: (id) => get().favoriteMatchIds.includes(id),
      isTeamFavorite: (team) => get().favoriteTeams.includes(team),
      isSportFavorite: (sport) => get().favoriteSports.includes(sport)
    }),
    {
      name: "pulse-arena-favorites",
      storage: createJSONStorage(() => idbStorage)
    }
  )
);
