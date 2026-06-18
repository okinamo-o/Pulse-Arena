"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { ScheduleHero } from "@/components/schedule/schedule-hero";
import { DateNavigator } from "@/components/schedule/date-navigator";
import { SportFilterBar } from "@/components/schedule/sport-filter-bar";
import { ScheduleTimeline } from "@/components/schedule/schedule-timeline";
import { QuickJump } from "@/components/schedule/quick-jump";
import { ScheduleFilters } from "@/components/schedule/schedule-filters";
import { ScheduleSidebar } from "@/components/schedule/schedule-sidebar";
import { CompetitionView } from "@/components/schedule/views/competition-view";
import { ErrorState } from "@/components/system/error-state";
import { useAllMatches, useSports } from "@/hooks/use-streamed";
import { useScheduleFilters } from "@/hooks/use-schedule-filters";
import { useScheduleGrouping } from "@/hooks/use-schedule-grouping";
import {
  toLocalDateString,
  getUserTimeZone,
  getTimeBlock,
  getDaysRange,
  type TimeBlock
} from "@/lib/streamed/schedule";

interface ScheduleViewProps {
  initialNow: number;
}

export function ScheduleView({ initialNow }: ScheduleViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: initialSports = [], isError: sportsError, refetch: refetchSports } = useSports();
  const { data: matches = [], isLoading, isFetching, isError: matchesError, refetch: refetchMatches } = useAllMatches();

  const isError = (sportsError || matchesError) && (!initialSports.length && !matches.length);

  const handleRetry = () => {
    if (sportsError) refetchSports();
    if (matchesError) refetchMatches();
  };

  const [mounted, setMounted] = React.useState(false);
  const [now, setNow] = React.useState(initialNow);
  const [viewMode, setViewMode] = React.useState<"timeline" | "competition">("timeline");

  React.useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedDate = React.useMemo(() => {
    return searchParams.get("date") || toLocalDateString(now, !mounted);
  }, [searchParams, now, mounted]);

  const selectedSports = React.useMemo(() => {
    const sportsParam = searchParams.get("sports");
    return sportsParam ? sportsParam.split(",") : [];
  }, [searchParams]);

  const handleSelectDate = (dateString: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", dateString);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleToggleSport = (sportId: string) => {
    const params = new URLSearchParams(searchParams);
    let updated = [...selectedSports];
    if (updated.includes(sportId)) {
      updated = updated.filter((id) => id !== sportId);
    } else {
      updated.push(sportId);
    }
    
    if (updated.length > 0) {
      params.set("sports", updated.join(","));
    } else {
      params.delete("sports");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("sports");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const days = React.useMemo(() => getDaysRange(10, initialNow, !mounted), [initialNow, mounted]);
  const timeZoneName = React.useMemo(() => (!mounted ? "UTC" : getUserTimeZone()), [mounted]);

  const matchesForSelectedDate = React.useMemo(() => {
    return matches.filter((match) => toLocalDateString(match.date, !mounted) === selectedDate);
  }, [matches, selectedDate, mounted]);

  // Use Custom Hooks for Logic
  const { searchQuery, setSearchQuery, filteredMatches } = useScheduleFilters(matchesForSelectedDate, selectedSports);
  const { hourGroups, competitionGroups } = useScheduleGrouping(filteredMatches, mounted);

  const activeBlocks = React.useMemo(() => {
    const blocksSet = new Set<string>();
    filteredMatches.forEach((m) => blocksSet.add(getTimeBlock(m.date, !mounted)));
    return Array.from(blocksSet) as TimeBlock[];
  }, [filteredMatches, mounted]);

  if (isError) {
    return (
      <main className="container-page min-h-screen pb-24 pt-32 md:pb-16 flex items-center justify-center">
        <ErrorState 
          message="Failed to synchronize with the main schedule array. The upstream provider might be down." 
          retry={handleRetry} 
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-graphite-950">
      <ScheduleHero matches={matches} />
      
      <DateNavigator
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        matches={matches}
        days={days}
        mounted={mounted}
      />

      <SportFilterBar
        sports={initialSports}
        selectedSports={selectedSports}
        onToggleSport={handleToggleSport}
        onClearFilters={handleClearFilters}
        matchesForSelectedDate={matchesForSelectedDate}
      />

      <div className="container-page mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-white/40">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-signal-cyan animate-pulse" />
            <span>Showing local times in {timeZoneName}</span>
          </div>
          {isFetching && !isLoading && (
            <div className="flex items-center gap-1.5 text-signal-lime animate-pulse font-mono font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-lime animate-ping" />
              <span>[SYNCING LATEST SCHEDULE...]</span>
            </div>
          )}
        </div>
        
        {viewMode === "timeline" && (
          <QuickJump activeBlocks={activeBlocks} />
        )}
      </div>

      <main className="container-page mt-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <ScheduleFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {isLoading ? (
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-graphite-900/60 p-12 text-center shadow-panel backdrop-blur-xl md:p-20">
                <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-signal-lime/10 blur-3xl" />
                <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-signal-cyan/10 blur-3xl" />
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-lime/30 opacity-75" />
                    <span className="relative inline-flex h-8 w-8 rounded-full bg-signal-lime shadow-glow" />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-lime/10 px-3 py-1 text-[0.68rem] font-bold tracking-widest text-signal-lime animate-pulse border border-signal-lime/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal-lime animate-ping" />
                      CONNECTING SIGNAL PANEL
                    </span>
                    <h3 className="font-display text-sm font-black uppercase tracking-[0.25em] text-white">
                      Scanning Arena Grid
                    </h3>
                  </div>
                  <div className="w-full max-w-sm rounded-lg border border-white/5 bg-black/40 p-4 font-mono text-[0.68rem] text-white/50 space-y-1.5 text-left">
                    <div className="flex items-center justify-between text-signal-cyan">
                      <span>&gt; INITIALIZING AGENT DECK...</span>
                      <span className="text-[0.62rem] font-bold">READY</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>&gt; CONNECTING SECURE PROXY: /api/streamed/matches/all</span>
                      <span className="text-signal-lime font-bold animate-pulse">RUNNING</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === "timeline" ? (
              <ScheduleTimeline groups={hourGroups} now={now} />
            ) : (
              <CompetitionView groups={competitionGroups} now={now} />
            )}
          </div>

          <ScheduleSidebar 
            matches={matches} 
            now={now} 
            mounted={mounted} 
            timeZoneName={timeZoneName} 
          />
        </div>
      </main>
    </div>
  );
}
