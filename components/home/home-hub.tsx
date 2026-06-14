"use client";

import Link from "next/link";
import { Activity, ArrowUpRight, Bell, Flame, Radio, Trophy } from "lucide-react";
import { FeaturedMatchHero } from "@/components/home/featured-match-hero";
import { MatchCard } from "@/components/match/match-card";
import { SectionHeader } from "@/components/ui/section-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { StreamedMatch, StreamedSport } from "@/lib/streamed/types";
import { formatSportName, sortByHeat } from "@/lib/streamed/selectors";

interface HomeHubProps {
  sports: StreamedSport[];
  liveMatches: StreamedMatch[];
  todayMatches: StreamedMatch[];
}

export function HomeHub({ sports, liveMatches, todayMatches }: HomeHubProps) {
  const featured = sortByHeat([...liveMatches, ...todayMatches])[0] ?? todayMatches[0];
  const trending = sortByHeat(liveMatches.length ? liveMatches : todayMatches).slice(0, 8);
  const popular = todayMatches.filter((match) => match.popular).slice(0, 8);
  const upcoming = [...todayMatches].sort((a, b) => a.date - b.date).slice(0, 10);

  return (
    <main className="pb-24 md:pb-16">
      {featured ? <FeaturedMatchHero match={featured} /> : null}
      <section className="container-page -mt-8 relative z-20 grid gap-3 md:grid-cols-4">
        <SignalStat icon={Radio} label="Live matches" value={String(liveMatches.length)} tone="lime" />
        <SignalStat icon={Flame} label="Popular today" value={String(popular.length)} tone="orange" />
        <SignalStat icon={Trophy} label="Sports" value={String(sports.length)} tone="cyan" />
        <SignalStat icon={Activity} label="Total signals" value={String(todayMatches.length)} tone="lime" />
      </section>

      <section className="container-page mt-12">
        <Reveal>
          <SectionHeader eyebrow="Trending live" title="Strongest signals now" actionHref="/live" actionLabel="Open live" />
        </Reveal>
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
          {trending.map((match) => (
            <div key={match.id} className="w-[min(86vw,390px)] shrink-0 snap-start">
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-14 grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div>
          <SectionHeader eyebrow="Popular events" title="Heat index picks" />
          <div className="grid gap-4 md:grid-cols-2">
            {popular.slice(0, 6).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="Upcoming" title="Timeline" />
          <GlassPanel className="p-3">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} variant="compact" className="mb-3 last:mb-0" />
            ))}
          </GlassPanel>
        </div>
      </section>

      <section className="container-page mt-14">
        <SectionHeader eyebrow="Sports categories" title="Choose your arena" actionHref="/sports" actionLabel="All sports" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {sports.map((sport, index) => {
            const count = todayMatches.filter((match) => match.category === sport.id).length;
            return (
              <Link
                key={sport.id}
                href={`/sports/${sport.id}`}
                className="clip-sport group min-h-36 border border-white/10 bg-white/[0.055] p-4 shadow-inner-line transition hover:-translate-y-1 hover:border-signal-lime/40 hover:bg-white/[0.085]"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={index % 3 === 0 ? "live" : index % 3 === 1 ? "cyan" : "hot"}>{count} today</Badge>
                  <ArrowUpRight className="h-5 w-5 text-white/32 transition group-hover:text-signal-lime" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-xl font-black uppercase text-white">{sport.name || formatSportName(sport.id)}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page mt-14">
        <GlassPanel className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center" glow="orange">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal-orange">Reminder system</p>
            <h2 className="mt-2 text-balance font-display text-3xl font-black uppercase text-white md:text-5xl">
              Never miss the kickoff window
            </h2>
          </div>
          <Button asChild variant="orange" size="lg">
            <Link href="/favorites">
              <Bell className="h-5 w-5" aria-hidden="true" />
              Manage reminders
            </Link>
          </Button>
        </GlassPanel>
      </section>
    </main>
  );
}

function SignalStat({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof Radio;
  label: string;
  value: string;
  tone: "lime" | "orange" | "cyan";
}) {
  const color = tone === "lime" ? "text-signal-lime" : tone === "orange" ? "text-signal-orange" : "text-signal-cyan";
  return (
    <GlassPanel className="p-4">
      <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
      <p className="mt-5 font-mono text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/42">{label}</p>
    </GlassPanel>
  );
}
