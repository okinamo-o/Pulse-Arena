"use client";

import { useQuery } from "@tanstack/react-query";
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

export function useSports() {
  return useQuery({
    queryKey: streamedQueryKeys.sports,
    queryFn: getSports,
    staleTime: 60 * 60 * 1000
  });
}

export function useAllMatches() {
  return useQuery({
    queryKey: streamedQueryKeys.allMatches,
    queryFn: getAllMatches,
    staleTime: 3 * 60 * 1000, // 3 min — schedule data doesn't change that fast
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 min during tab switches
  });
}

export function useLiveMatches() {
  return useQuery({
    queryKey: streamedQueryKeys.liveMatches,
    queryFn: getLiveMatches,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000
  });
}

export function useTodayMatches() {
  return useQuery({
    queryKey: streamedQueryKeys.todayMatches,
    queryFn: getTodayMatches,
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
