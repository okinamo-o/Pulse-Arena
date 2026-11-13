"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPpvDirectory, getStreams, slugifyCategory } from "@/lib/ppv/client";
import { getMatchStatus } from "@/lib/ppv/selectors";
import type { PpvDirectory, SportCategory, SportMatch } from "@/lib/ppv/types";

export const ppvQueryKeys = {
  directory: ["ppv", "directory"] as const,
  streams: (source: string, id: string) => ["ppv", "streams", id, source] as const,
};

function selectSports(directory: PpvDirectory): SportCategory[] {
  return directory.sports;
}

function selectAllMatches(directory: PpvDirectory): SportMatch[] {
  return directory.matches;
}

function selectLiveMatches(directory: PpvDirectory): SportMatch[] {
  const now = Date.now();
  return directory.matches.filter((match) => getMatchStatus(match, now) === "live");
}

function selectTodayMatches(directory: PpvDirectory): SportMatch[] {
  const now = Date.now();
  const minWindow = now - 12 * 60 * 60 * 1000;
  const maxWindow = now + 30 * 60 * 60 * 1000;

  const filtered = directory.matches.filter((match) => {
    if (match.alwaysLive) return true;
    const status = getMatchStatus(match, now);
    if (status === "live" || status === "recent") return true;
    return match.date >= minWindow && match.date <= maxWindow;
  });

  return filtered.length > 0 ? filtered : directory.matches;
}

function usePpvDirectoryQuery<T>(
  select: (directory: PpvDirectory) => T,
  options?: { enabled?: boolean; refetchInterval?: number; staleTime?: number }
) {
  return useQuery({
    queryKey: ppvQueryKeys.directory,
    queryFn: () => getPpvDirectory(),
    select,
    staleTime: options?.staleTime ?? 20 * 1000,
    refetchInterval: options?.refetchInterval ?? 30 * 1000,
    gcTime: 1000 * 60 * 60 * 6,
    enabled: options?.enabled ?? true,
  });
}

export function useSports(enabled = true) {
  return usePpvDirectoryQuery(selectSports, {
    enabled,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAllMatches(enabled = true) {
  return usePpvDirectoryQuery(selectAllMatches, {
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 45 * 1000,
  });
}

export function useLiveMatches(enabled = true) {
  return usePpvDirectoryQuery(selectLiveMatches, {
    enabled,
    staleTime: 15 * 1000,
    refetchInterval: 25 * 1000,
  });
}

export function useTodayMatches(enabled = true) {
  return usePpvDirectoryQuery(selectTodayMatches, {
    enabled,
    staleTime: 20 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMatchesBySport(sport: string) {
  const normalized = slugifyCategory(sport);
  const selector = React.useCallback(
    (directory: PpvDirectory) =>
      directory.matches.filter((match) => match.category === normalized || match.category === sport),
    [normalized, sport]
  );

  return usePpvDirectoryQuery(selector, {
    enabled: Boolean(sport),
    staleTime: 30 * 1000,
  });
}

export function usePopularMatchesBySport(sport: string) {
  const normalized = slugifyCategory(sport);
  const selector = React.useCallback(
    (directory: PpvDirectory) =>
      directory.matches.filter(
        (match) => (match.category === normalized || match.category === sport) && match.popular
      ),
    [normalized, sport]
  );

  return usePpvDirectoryQuery(selector, {
    enabled: Boolean(sport),
    staleTime: 60 * 1000,
  });
}

export function useStreams(source: string, id: string, enabled = true) {
  return useQuery({
    queryKey: ppvQueryKeys.streams(source, id),
    queryFn: () => getStreams(source, id),
    staleTime: 20 * 1000,
    refetchInterval: 35 * 1000,
    enabled: Boolean(id && enabled),
    gcTime: 1000 * 60 * 5,
  });
}

