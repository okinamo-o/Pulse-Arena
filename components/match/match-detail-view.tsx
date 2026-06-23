"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Radio, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { CountdownChip } from "@/components/match/countdown-chip";
import { FavoriteButton } from "@/components/match/favorite-button";
import { MomentumMeter } from "@/components/match/momentum-meter";
import { ReminderButton } from "@/components/match/reminder-button";
import { TeamBadge } from "@/components/match/team-badge";
import { MatchCard } from "@/components/match/match-card";
import { LiveScoreboard } from "@/components/match/live-scoreboard";
import { MatchAnalyticsTabs } from "@/components/match/match-analytics-tabs";
import { buildMatchInsights, formatSportName, getMatchParticipants } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";

interface MatchDetailViewProps {
  match: StreamedMatch;
  related: StreamedMatch[];
}

export function MatchDetailView({ match, related }: MatchDetailViewProps) {
  const participants = getMatchParticipants(match);
  const firstSource = match.sources[0];
  const insights = buildMatchInsights(match);

  return (
    <main className="pb-44 pt-32 md:pb-16">
      <section className="container-page">
        <GlassPanel className="relative overflow-hidden p-5 md:p-8" glow="lime">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgb(183_255_42_/_0.18),transparent_30%),radial-gradient(circle_at_78%_26%,rgb(20_55_216_/_0.28),transparent_36%),linear-gradient(135deg,rgb(255_255_255_/_0.08),transparent_42%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <CountdownChip date={match.date} />
                <Badge variant="cyan">{formatSportName(match.category)}</Badge>
                {match.popular ? <Badge variant="hot">Trending</Badge> : null}
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <TeamBadge name={participants.home} badge={match.teams?.home?.badge} size="xl" />
                <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 font-mono text-sm font-black text-white/56">
                  VS
                </div>
                <TeamBadge name={participants.away} badge={match.teams?.away?.badge} size="xl" />
              </div>
              <h1 className="mt-8 text-balance font-display text-4xl font-black uppercase leading-[0.95] text-white md:text-7xl">
                {match.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3">
                {firstSource ? (
                  <Button asChild size="lg">
                    <Link href={`/watch/${encodeURIComponent(firstSource.source)}/${encodeURIComponent(firstSource.id)}`}>
                      <Radio className="h-5 w-5" aria-hidden="true" />
                      Watch now
                    </Link>
                  </Button>
                ) : null}
                <ReminderButton match={match} />
                <FavoriteButton match={match} />
                <Button variant="secondary" size="icon" aria-label="Share match">
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 content-start">
              <div className="grid grid-cols-2 gap-3">
                <Stat icon={Calendar} label="Start" value={new Date(match.date).toLocaleString()} />
                <Stat icon={Radio} label="Sources" value={`${match.sources.length} active`} />
              </div>
              <MomentumMeter match={match} />
              <div className="grid gap-2">
                {insights.map((insight) => (
                  <div key={insight.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/42">{insight.label}</span>
                    <span className="text-sm font-semibold text-white">{insight.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="container-page mt-8">
        <LiveScoreboard 
          homeTeam={participants.home} 
          awayTeam={participants.away} 
          homeBadge={match.teams?.home?.badge}
          awayBadge={match.teams?.away?.badge}
          matchDate={match.date}
          category={match.category}
        />
      </section>

      <section className="container-page mt-8">
        <MatchAnalyticsTabs homeTeam={participants.home} awayTeam={participants.away} category={match.category} />
      </section>

      {related.length > 0 ? (
        <section className="container-page mt-12">
          <SectionHeader eyebrow="Next signals" title="Related matches" actionHref="/live" actionLabel="Live hub" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.slice(0, 6).map((item) => (
              <MatchCard key={item.id} match={item} />
            ))}
          </div>
        </section>
      ) : null}

      {firstSource ? (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 px-4 md:hidden">
          <Button asChild className="w-full shadow-glow" size="lg">
            <Link href={`/watch/${encodeURIComponent(firstSource.source)}/${encodeURIComponent(firstSource.id)}`}>
              Watch now
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : null}
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/22 p-4 shadow-inner-line">
      <Icon className="h-5 w-5 text-signal-lime" aria-hidden="true" />
      <p className="mt-4 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-white/42">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}
