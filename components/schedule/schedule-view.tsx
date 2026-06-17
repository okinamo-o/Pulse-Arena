"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Flame, LayoutList, Trophy, Globe } from "lucide-react";
import { ScheduleHero } from "@/components/schedule/schedule-hero";
import { DateNavigator } from "@/components/schedule/date-navigator";
import { SportFilterBar } from "@/components/schedule/sport-filter-bar";
import { ScheduleTimeline } from "@/components/schedule/schedule-timeline";
import { QuickJump } from "@/components/schedule/quick-jump";
import { ScheduleCard } from "@/components/schedule/schedule-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { useAllMatches, useSports } from "@/hooks/use-streamed";
import {
  toLocalDateString,
  groupMatchesByHour,
  getUserTimeZone,
  getTimeBlock,
  getDaysRange,
  type TimeBlock
} from "@/lib/streamed/schedule";
import { formatSportName, getMatchStatus } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";
import { cn } from "@/lib/utils/cn";

interface ScheduleViewProps {
  initialNow: number;
}

export function ScheduleView({ initialNow }: ScheduleViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load sports and matches via react-query
  const { data: initialSports = [] } = useSports();
  const { data: matches = [], isLoading, isFetching } = useAllMatches();

  const [mounted, setMounted] = React.useState(false);
  const [now, setNow] = React.useState(initialNow);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"timeline" | "competition">("timeline");

  // Central timer & mounting check
  React.useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Deep linking sync for Date
  const selectedDate = React.useMemo(() => {
    return searchParams.get("date") || toLocalDateString(now, !mounted);
  }, [searchParams, now, mounted]);

  // Deep linking sync for Sports filters
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

  // Generate days navigator dynamically & hydration-safely
  const days = React.useMemo(() => {
    return getDaysRange(10, initialNow, !mounted);
  }, [initialNow, mounted]);

  // Get user timezone details safely
  const timeZoneName = React.useMemo(() => {
    if (!mounted) return "UTC";
    return getUserTimeZone();
  }, [mounted]);

  // Filter 1: Matches occurring on the selected date (local/UTC time)
  const matchesForSelectedDate = React.useMemo(() => {
    return matches.filter((match) => toLocalDateString(match.date, !mounted) === selectedDate);
  }, [matches, selectedDate, mounted]);

  // Filter 2: Matches filtered by active sport category filters and search text input
  const filteredMatches = React.useMemo(() => {
    return matchesForSelectedDate.filter((match) => {
      // Sport Category filter
      if (selectedSports.length > 0 && !selectedSports.includes(match.category)) {
        return false;
      }
      
      // Search search term filter
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery.toLowerCase().trim();
        const haystack = `${match.title} ${match.category} ${match.teams?.home?.name ?? ""} ${match.teams?.away?.name ?? ""}`.toLowerCase();
        return cleanQuery.split(/\s+/).every((term) => haystack.includes(term));
      }
      
      return true;
    });
  }, [matchesForSelectedDate, selectedSports, searchQuery]);

  // Grouped results for Timeline view
  const hourGroups = React.useMemo(() => {
    return groupMatchesByHour(filteredMatches, !mounted);
  }, [filteredMatches, mounted]);

  // Grouped results by Category/Competition for Competition view
  const competitionGroups = React.useMemo(() => {
    const map: Record<string, StreamedMatch[]> = {};
    filteredMatches.forEach((m) => {
      const cat = m.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(m);
    });
    return Object.keys(map).map((catId) => ({
      category: catId,
      matches: map[catId]
    }));
  }, [filteredMatches]);

  // Retrieve popular upcoming events globally (next 7 days)
  const popularUpcoming = React.useMemo(() => {
    return matches
      .filter((m) => getMatchStatus(m, now) === "upcoming" && m.popular)
      .sort((a, b) => a.date - b.date)
      .slice(0, 5);
  }, [matches, now]);

  // Find active time blocks for quick jump
  const activeBlocks = React.useMemo(() => {
    const blocksSet = new Set<string>();
    filteredMatches.forEach((m) => {
      blocksSet.add(getTimeBlock(m.date, !mounted));
    });
    return Array.from(blocksSet) as TimeBlock[];
  }, [filteredMatches, mounted]);

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

      {/* Quick Jump & Timezone Indicator */}
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
          {/* Left Area: Main Schedule Content */}
          <div className="space-y-6">
            {/* Filter controls and view mode toggles */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Fuzzy search this schedule..."
                  className="pl-9 bg-graphite-900 border-white/10"
                />
              </div>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition",
                    viewMode === "timeline" ? "bg-white/[0.08] text-white shadow-inner-line" : "text-white/50 hover:text-white"
                  )}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode("competition")}
                  className={cn(
                    "flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition",
                    viewMode === "competition" ? "bg-white/[0.08] text-white shadow-inner-line" : "text-white/50 hover:text-white"
                  )}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Competitions
                </button>
              </div>
            </div>

            {/* Render selected view */}
            {isLoading ? (
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-graphite-900/60 p-12 text-center shadow-panel backdrop-blur-xl md:p-20">
                {/* Neon glow effect */}
                <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-signal-lime/10 blur-3xl" />
                <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-signal-cyan/10 blur-3xl" />
                
                <div className="flex flex-col items-center justify-center space-y-6">
                  {/* Radar/Sonar Pulse Animation */}
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

                  {/* Mono diagnostics details */}
                  <div className="w-full max-w-sm rounded-lg border border-white/5 bg-black/40 p-4 font-mono text-[0.68rem] text-white/50 space-y-1.5 text-left">
                    <div className="flex items-center justify-between text-signal-cyan">
                      <span>&gt; INITIALIZING AGENT DECK...</span>
                      <span className="text-[0.62rem] font-bold">READY</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>&gt; CONNECTING SECURE PROXY: /api/streamed/matches/all</span>
                      <span className="text-signal-lime font-bold animate-pulse">RUNNING</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>&gt; RETRIEVING 10-DAY SPORTS MATRIX...</span>
                      <span className="text-white/30 font-bold">WAITING</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[0.6rem] text-white/30 uppercase">
                      <span>TIME STAMP</span>
                      <span>{new Date(initialNow).toISOString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === "timeline" ? (
              <ScheduleTimeline groups={hourGroups} now={now} />
            ) : (
              <div className="space-y-8">
                {competitionGroups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="font-mono text-sm uppercase tracking-widest text-white/30">
                      No matches found
                    </p>
                    <p className="mt-2 text-sm text-white/54">Adjust filters and search queries.</p>
                  </div>
                ) : (
                  competitionGroups.map((group) => (
                    <section key={group.category} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Trophy className="h-4 w-4 text-signal-cyan" />
                        <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">
                          {formatSportName(group.category)}
                        </h2>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.62rem] font-bold text-white/50">
                          {group.matches.length} matches
                        </span>
                      </div>
                      <div className="space-y-3">
                        {group.matches.map((match) => (
                          <ScheduleCard key={match.id} match={match} now={now} />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Area: Sidebar for Popular Upcoming Matches */}
          <div className="space-y-6">
            <GlassPanel className="p-4" glow="orange">
              <div className="flex items-center gap-2 mb-4 text-signal-orange">
                <Flame className="h-5 w-5" />
                <h3 className="font-display text-xs font-black uppercase tracking-wider">
                  Popular Upcoming Matches
                </h3>
              </div>

              <div className="space-y-3">
                {popularUpcoming.length === 0 ? (
                  <p className="text-xs text-white/38 py-4 text-center">
                    No hot matches upcoming.
                  </p>
                ) : (
                  popularUpcoming.map((match) => {
                    const localTime = new Intl.DateTimeFormat("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: mounted ? undefined : "UTC"
                    }).format(match.date);
                    const localDate = new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                      timeZone: mounted ? undefined : "UTC"
                    }).format(match.date);

                    return (
                      <Link
                        key={match.id}
                        href={`/match/${match.id}`}
                        className="group block rounded-lg border border-white/5 bg-white/[0.02] p-2.5 transition hover:border-signal-orange/30 hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[0.62rem] font-black uppercase tracking-wider text-signal-cyan">
                            {formatSportName(match.category)}
                          </span>
                          <span suppressHydrationWarning className="font-mono text-[0.68rem] font-bold text-white/40">
                            {localDate} {localTime}
                          </span>
                        </div>
                        <p className="mt-1.5 truncate text-xs font-bold text-white/90 group-hover:text-white">
                          {match.title}
                        </p>
                      </Link>
                    );
                  })
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-4">
              <h4 className="font-display text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                Timezone Info
              </h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Matches are automatically formatted using your browser timezone settings ({timeZoneName}). Set reminders on upcoming signals to receive notifications.
              </p>
            </GlassPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
