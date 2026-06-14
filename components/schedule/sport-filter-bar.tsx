"use client";

import * as React from "react";
import { formatSportName } from "@/lib/streamed/selectors";
import type { StreamedSport, StreamedMatch } from "@/lib/streamed/types";
import { cn } from "@/lib/utils/cn";

interface SportFilterBarProps {
  sports: StreamedSport[];
  selectedSports: string[];
  onToggleSport: (sportId: string) => void;
  onClearFilters: () => void;
  matchesForSelectedDate: StreamedMatch[];
}

export function SportFilterBar({
  sports,
  selectedSports,
  onToggleSport,
  onClearFilters,
  matchesForSelectedDate
}: SportFilterBarProps) {
  // Calculate event counts per sport category for the selected date
  const sportCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    matchesForSelectedDate.forEach((match) => {
      counts[match.category] = (counts[match.category] || 0) + 1;
    });
    return counts;
  }, [matchesForSelectedDate]);

  return (
    <div className="py-4 border-b border-white/5 bg-graphite-950/40">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Header & Reset */}
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
              Filter by Arena
            </h3>
            {selectedSports.length > 0 && (
              <button
                onClick={onClearFilters}
                className="text-xs font-bold text-signal-orange hover:underline"
              >
                Clear all ({selectedSports.length})
              </button>
            )}
          </div>

          {/* Chips list */}
          <div className="no-scrollbar flex w-full flex-wrap gap-2 sm:w-auto">
            {/* "All" button */}
            <button
              onClick={onClearFilters}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all duration-200",
                selectedSports.length === 0
                  ? "bg-signal-cyan text-graphite-950 shadow-[0_0_12px_rgba(49,215,255,0.3)]"
                  : "border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white"
              )}
            >
              All Arenas
              <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[0.65rem] font-black">
                {matchesForSelectedDate.length}
              </span>
            </button>

            {/* Individual sport chips */}
            {sports.map((sport) => {
              const isActive = selectedSports.includes(sport.id);
              const count = sportCounts[sport.id] || 0;
              
              // Skip rendering sport chips that have no matches on the selected date to keep the UI clean,
              // UNLESS they are currently selected.
              if (count === 0 && !isActive) return null;

              return (
                <button
                  key={sport.id}
                  onClick={() => onToggleSport(sport.id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-signal-lime text-graphite-950 shadow-[0_0_12px_rgba(183,255,42,0.3)]"
                      : "border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white"
                  )}
                >
                  {sport.name || formatSportName(sport.id)}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.65rem] font-black",
                      isActive ? "bg-black/20 text-graphite-950" : "bg-white/10 text-white/50"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
