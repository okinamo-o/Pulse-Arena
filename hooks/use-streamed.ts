"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  getAllMatches,
  getLiveMatches,
  getMatchesBySport,
  getPopularMatchesBySport,
  getSports,
  getStreams,
  getTodayMatches
} from "@/lib/streamed/client";

export const streamedQueryKeys = {
  sports: ["streamed", "sports"] as const,
  allMatches: ["streamed", "matches", "all"] as const,
  liveMatches: ["streamed", "matches", "live"] as const,
  todayMatches: ["streamed", "matches", "today"] as const,
  sportMatches: (sport: string) => ["streamed", "matches", "sport", sport] as const,
  popularSportMatches: (sport: string) => ["streamed", "matches", "sport", sport, "popular"] as const,
  streams: (source: string, id: string) => ["streamed", "streams", source, id] as const
};

// ---------------------------------------------------------------------------
// localStorage seeding helper
// ---------------------------------------------------------------------------
// Reads from localStorage on first mount and seeds the query cache so the
// page renders instantly with cached data. A background refetch is triggered
// automatically because the data is set with an updatedAt of 0 (always stale).
// ---------------------------------------------------------------------------

function useLocalStorageSeed<T>(
  storageKey: string,
  queryKey: readonly unknown[]
) {
  const queryClient = useQueryClient();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        // Only seed if the query cache is currently empty for this key
        if (!queryClient.getQueryData(queryKey)) {
          queryClient.setQueryData(queryKey, parsed);
        }
      }
    } catch {
      // Corrupt localStorage entry — ignore
    }
  }, [storageKey, queryKey, queryClient]);
}

function saveToLocalStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useSports() {
  useLocalStorageSeed("streamed_sports", streamedQueryKeys.sports);

  return useQuery({
    queryKey: streamedQueryKeys.sports,
    queryFn: async () => {
      const data = await getSports();
      saveToLocalStorage("streamed_sports", data);
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 120 * 60 * 1000,   // 2 hours
  });
}

export function useAllMatches() {
  useLocalStorageSeed("streamed_all_matches", streamedQueryKeys.allMatches);

  return useQuery({
    queryKey: streamedQueryKeys.allMatches,
    queryFn: async () => {
      const data = await getAllMatches();
      saveToLocalStorage("streamed_all_matches", data);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
}

export function useLiveMatches() {
  useLocalStorageSeed("streamed_live_matches", streamedQueryKeys.liveMatches);

  return useQuery({
    queryKey: streamedQueryKeys.liveMatches,
    queryFn: async () => {
      const data = await getLiveMatches();
      saveToLocalStorage("streamed_live_matches", data);
      return data;
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000
  });
}

export function useTodayMatches() {
  useLocalStorageSeed("streamed_today_matches", streamedQueryKeys.todayMatches);

  return useQuery({
    queryKey: streamedQueryKeys.todayMatches,
    queryFn: async () => {
      const data = await getTodayMatches();
      saveToLocalStorage("streamed_today_matches", data);
      return data;
    },
    staleTime: 60 * 1000
  });
}

export function useMatchesBySport(sport: string) {
  return useQuery({
    queryKey: streamedQueryKeys.sportMatches(sport),
    queryFn: () => getMatchesBySport(sport),
    staleTime: 60 * 1000,
    enabled: Boolean(sport)
  });
}

export function usePopularMatchesBySport(sport: string) {
  return useQuery({
    queryKey: streamedQueryKeys.popularSportMatches(sport),
    queryFn: () => getPopularMatchesBySport(sport),
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(sport)
  });
}

export function useStreams(source: string, id: string, enabled = true) {
  return useQuery({
    queryKey: streamedQueryKeys.streams(source, id),
    queryFn: () => getStreams(source, id),
    staleTime: 20 * 1000,
    refetchInterval: 35 * 1000,
    enabled: Boolean(source && id && enabled)
  });
}
