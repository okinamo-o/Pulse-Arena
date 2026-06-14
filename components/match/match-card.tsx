"use client";

import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountdownChip } from "@/components/match/countdown-chip";
import { FavoriteButton } from "@/components/match/favorite-button";
import { ReminderButton } from "@/components/match/reminder-button";
import { TeamBadge } from "@/components/match/team-badge";
import { MomentumMeter } from "@/components/match/momentum-meter";
import { formatSportName, getHeatScore, getMatchParticipants } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";
import { cn } from "@/lib/utils/cn";

interface MatchCardProps {
  match: StreamedMatch;
  variant?: "default" | "compact" | "hero";
  className?: string;
}

export function MatchCard({ match, variant = "default", className }: MatchCardProps) {
  const participants = getMatchParticipants(match);
  const heat = getHeatScore(match);
  const firstSource = match.sources[0];

  if (variant === "compact") {
    return (
      <Link
        href={`/match/${match.id}`}
        className={cn(
          "group grid min-h-28 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.08] p-3 shadow-inner-line transition hover:-translate-y-0.5 hover:border-signal-lime/40 hover:bg-white/[0.12]",
          className
        )}
      >
        <TeamBadge name={participants.home} badge={match.teams?.home?.badge} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black uppercase text-white">{match.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <CountdownChip date={match.date} />
            <Badge variant="muted">{formatSportName(match.category)}</Badge>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-white/50 transition group-hover:text-signal-lime" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <article
      className={cn(
        "group relative min-h-[360px] overflow-hidden rounded-xl border border-white/10 bg-graphite-900/90 p-4 shadow-panel shadow-black/30 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-signal-lime/35",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_14%,rgb(183_255_42_/_0.14),transparent_28%),radial-gradient(circle_at_82%_16%,rgb(49_215_255_/_0.12),transparent_30%),linear-gradient(145deg,rgb(255_255_255_/_0.06),transparent_55%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <CountdownChip date={match.date} />
            <Badge variant={match.popular ? "hot" : "cyan"}>{formatSportName(match.category)}</Badge>
          </div>
          <div className="flex gap-2">
            <ReminderButton match={match} compact />
            <FavoriteButton match={match} compact />
          </div>
        </div>
        <Link href={`/match/${match.id}`} className="mt-7 block">
          <div className="flex items-center justify-center gap-4">
            <TeamBadge name={participants.home} badge={match.teams?.home?.badge} size="lg" />
            <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs font-black text-white/80">
              VS
            </div>
            <TeamBadge name={participants.away} badge={match.teams?.away?.badge} size="lg" />
          </div>
          <h3 className="mt-6 text-balance text-center font-display text-2xl font-black uppercase leading-tight text-white">
            {match.title}
          </h3>
        </Link>
        <div className="mt-auto space-y-4 pt-6">
          <MomentumMeter match={match} compact />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/72">
              <Radio className="h-4 w-4 text-signal-lime" aria-hidden="true" />
              {match.sources.length} source{match.sources.length === 1 ? "" : "s"}
            </div>
            {firstSource ? (
              <Link
                href={`/watch/${firstSource.source}/${encodeURIComponent(firstSource.id)}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-signal-lime px-3 text-sm font-black text-graphite-950 transition hover:bg-[#d6ff76]"
              >
                Watch
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full bg-live-gradient" style={{ width: `${heat}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}
