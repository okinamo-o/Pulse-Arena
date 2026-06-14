"use client";

import * as React from "react";
import { HourGroup, TIME_BLOCKS, type TimeBlock } from "@/lib/streamed/schedule";
import { ScheduleCard } from "@/components/schedule/schedule-card";
import { useFavoritesStore } from "@/store/favorites-store";
import { getMatchParticipants } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";

interface ScheduleTimelineProps {
  groups: HourGroup[];
}

export function ScheduleTimeline({ groups }: ScheduleTimelineProps) {
  const favoriteTeams = useFavoritesStore((state) => state.favoriteTeams);
  const favoriteMatchIds = useFavoritesStore((state) => state.favoriteMatchIds);

  // Sorting matches to place favorites (teams or specific matches) first
  const getSortedMatches = React.useCallback(
    (matches: StreamedMatch[]) => {
      return [...matches].sort((a, b) => {
        const aParticipants = getMatchParticipants(a);
        const bParticipants = getMatchParticipants(b);

        const aHasFavTeam = favoriteTeams.some(
          (team) =>
            aParticipants.home.toLowerCase().includes(team.toLowerCase()) ||
            aParticipants.away.toLowerCase().includes(team.toLowerCase())
        );
        const bHasFavTeam = favoriteTeams.some(
          (team) =>
            bParticipants.home.toLowerCase().includes(team.toLowerCase()) ||
            bParticipants.away.toLowerCase().includes(team.toLowerCase())
        );

        const aIsFavMatch = favoriteMatchIds.includes(a.id);
        const bIsFavMatch = favoriteMatchIds.includes(b.id);

        const aScore = (aIsFavMatch ? 2 : 0) + (aHasFavTeam ? 1 : 0);
        const bScore = (bIsFavMatch ? 2 : 0) + (bHasFavTeam ? 1 : 0);

        return bScore - aScore; // Descending
      });
    },
    [favoriteTeams, favoriteMatchIds]
  );

  // Map groups by time block for rendering time block dividers
  const blockGroups = React.useMemo(() => {
    const blocksMap: Record<TimeBlock, HourGroup[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    groups.forEach((g) => {
      blocksMap[g.timeBlock].push(g);
    });

    return blocksMap;
  }, [groups]);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-white/30">
          No matches found
        </p>
        <p className="mt-2 text-sm text-white/54">
          Adjust sport filters or select another date.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-12">
      {/* Decorative vertical timeline rail */}
      <div className="absolute left-[39px] top-6 bottom-6 w-px bg-gradient-to-b from-signal-lime/30 via-signal-cyan/20 to-transparent md:left-[51px]" />

      {TIME_BLOCKS.map((block) => {
        const hourGroups = blockGroups[block.id];
        if (hourGroups.length === 0) return null;

        return (
          <section key={block.id} id={`timeblock-${block.id}`} className="relative scroll-mt-36">
            {/* Timeblock Section Title */}
            <div className="sticky top-[166px] z-10 -ml-1 flex items-center gap-2 bg-graphite-950/80 py-2.5 backdrop-blur-md">
              <div className="h-2 w-2 rounded-full bg-signal-lime shadow-glow" />
              <h2 className="font-display text-sm font-black uppercase tracking-[0.2em] text-white">
                {block.label}{" "}
                <span className="text-[0.68rem] font-bold text-white/30 lowercase tracking-normal">
                  ({block.hoursRange})
                </span>
              </h2>
            </div>

            {/* Hour groups within this block */}
            <div className="mt-6 space-y-8">
              {hourGroups.map((group) => {
                const sorted = getSortedMatches(group.matches);

                return (
                  <div key={group.hourString} className="flex gap-4 md:gap-8">
                    {/* Time Indicator */}
                    <div className="flex flex-col items-center shrink-0 w-20 md:w-24">
                      <div className="flex h-9 items-center justify-center rounded-full bg-white/[0.04] border border-white/5 px-2.5 font-mono text-xs font-black text-white/90 shadow-inner-line group-hover:border-signal-lime/40">
                        {group.hourString}
                      </div>
                      <div className="mt-2 flex-1 w-px bg-white/5" />
                    </div>

                    {/* Cards Stack */}
                    <div className="flex-1 space-y-3">
                      {sorted.map((match) => (
                        <ScheduleCard key={match.id} match={match} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
