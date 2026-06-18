"use client";

import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ErrorState } from "@/components/system/error-state";
import { useSports, useTodayMatches } from "@/hooks/use-streamed";

export function SportsDirectory() {
  const { data: sports = [], isLoading: sportsLoading, isError: sportsError, refetch: refetchSports } = useSports();
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useTodayMatches();

  const isLoading = sportsLoading && matchesLoading;
  const isError = (sportsError || matchesError) && (!sports.length && !matches.length);

  const handleRetry = () => {
    if (sportsError) refetchSports();
    if (matchesError) refetchMatches();
  };

  if (isLoading) {
    return (
      <main className="container-page min-h-screen pb-24 pt-32 md:pb-16">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-graphite-900/60 p-12 text-center shadow-panel backdrop-blur-xl md:p-20">
          <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-signal-cyan/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-signal-lime/10 blur-3xl" />
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-cyan/30 opacity-75" />
              <span className="relative inline-flex h-8 w-8 rounded-full bg-signal-cyan shadow-glow" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-cyan/10 px-3 py-1 text-[0.68rem] font-bold tracking-widest text-signal-cyan animate-pulse border border-signal-cyan/20">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-ping" />
                INDEXING SPORTS CATEGORIES
              </span>
              <h3 className="font-display text-sm font-black uppercase tracking-[0.25em] text-white">
                Loading Sports Directory
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
          message="Failed to index the sports categories. The upstream provider might be unavailable." 
          retry={handleRetry} 
        />
      </main>
    );
  }

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-panel backdrop-blur-2xl">
        <Badge variant="cyan">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          Sports index
        </Badge>
        <h1 className="mt-5 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          Every sport, ranked by live signal
        </h1>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {sports.map((sport, index) => {
          const sportMatches = matches.filter((match) => match.category === sport.id);
          const liveCount = sportMatches.filter((match) => match.date <= Date.now()).length;
          return (
            <Link key={sport.id} href={`/sports/${sport.id}`} className="group">
              <GlassPanel className="clip-sport min-h-52 p-5 transition group-hover:-translate-y-1 group-hover:border-signal-lime/40">
                <div className="flex items-center justify-between">
                  <Badge variant={index % 2 === 0 ? "live" : "hot"}>{sportMatches.length} events</Badge>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:text-signal-lime" aria-hidden="true" />
                </div>
                <h2 className="mt-10 text-2xl font-black uppercase text-white">{sport.name}</h2>
                <p className="mt-2 text-sm text-white/52">{liveCount} signals are in or near the live window.</p>
              </GlassPanel>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
