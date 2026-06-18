"use client";

import { Radio } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/system/error-state";
import { useLiveMatches, useSports } from "@/hooks/use-streamed";
import { formatSportName, sortByHeat } from "@/lib/streamed/selectors";

export function LiveDashboard() {
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useLiveMatches();
  const { data: sports = [], isLoading: sportsLoading, isError: sportsError, refetch: refetchSports } = useSports();

  const isLoading = matchesLoading && sportsLoading;
  const isError = (matchesError || sportsError) && (!matches.length && !sports.length);

  const handleRetry = () => {
    if (matchesError) refetchMatches();
    if (sportsError) refetchSports();
  };
  const sorted = sortByHeat(matches);

  if (isLoading) {
    return (
      <main className="container-page min-h-screen pb-24 pt-32 md:pb-16">
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
                SCANNING LIVE FEEDS
              </span>
              <h3 className="font-display text-sm font-black uppercase tracking-[0.25em] text-white">
                Loading Live Control Room
              </h3>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container-page min-h-[70vh] pb-24 pt-32 md:pb-16 flex items-center justify-center">
        <ErrorState 
          message="Failed to synchronize with the live control room. The upstream provider might be unavailable." 
          retry={handleRetry} 
        />
      </main>
    );
  }

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-panel backdrop-blur-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="live">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            {matches.length} live signals
          </Badge>
          {sports.slice(0, 8).map((sport) => (
            <a
              key={sport.id}
              href={`#${sport.id}`}
              className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/58 transition hover:border-signal-lime/40 hover:text-white"
            >
              {sport.name}
            </a>
          ))}
        </div>
        <h1 className="mt-6 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          Live sports control room
        </h1>
      </div>

      <SectionHeader eyebrow="All live matches" title="Ranked by heat" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {sports.map((sport) => {
        const sportMatches = sorted.filter((match) => match.category === sport.id);
        if (sportMatches.length === 0) return null;
        return (
          <section key={sport.id} id={sport.id} className="mt-14 scroll-mt-32">
            <SectionHeader eyebrow={formatSportName(sport.id)} title={`${sportMatches.length} live now`} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sportMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
