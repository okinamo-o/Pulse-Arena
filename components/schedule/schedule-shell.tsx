"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamedQueryKeys } from "@/hooks/use-streamed";
import { ScheduleView } from "@/components/schedule/schedule-view";
import type { StreamedMatch, StreamedSport } from "@/lib/streamed/types";

interface ScheduleShellProps {
  initialSports: StreamedSport[];
  initialMatches: StreamedMatch[];
}

/**
 * Bridge between server-fetched data and the client ScheduleView.
 * Seeds the react-query cache with server data so the view renders
 * instantly instead of showing a loading skeleton.
 */
export function ScheduleShell({ initialSports, initialMatches }: ScheduleShellProps) {
  const queryClient = useQueryClient();

  // Seed the query cache ONCE on mount with the server-provided data.
  // This ensures useAllMatches() and useSports() inside ScheduleView
  // return data immediately instead of triggering a fetch + loading state.
  const seeded = React.useRef(false);
  if (!seeded.current) {
    queryClient.setQueryData(streamedQueryKeys.sports, initialSports);
    queryClient.setQueryData(streamedQueryKeys.allMatches, initialMatches);
    seeded.current = true;
  }

  return <ScheduleView />;
}
