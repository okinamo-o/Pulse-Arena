"use client";

import { Radio } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import type { StreamedMatch, StreamedSport } from "@/lib/streamed/types";
import { formatSportName, sortByHeat } from "@/lib/streamed/selectors";

export function LiveDashboard({ matches, sports }: { matches: StreamedMatch[]; sports: StreamedSport[] }) {
  const sorted = sortByHeat(matches);

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
