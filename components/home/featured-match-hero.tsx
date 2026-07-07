"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountdownChip } from "@/components/match/countdown-chip";
import { MomentumMeter } from "@/components/match/momentum-meter";
import { TeamBadge } from "@/components/match/team-badge";
import { usePreferencesStore } from "@/store/preferences-store";
import { posterImageUrl } from "@/lib/streamed/client";
import { formatSportName, getMatchParticipants } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";

interface FeaturedMatchHeroProps {
  match: StreamedMatch;
}

export function FeaturedMatchHero({ match }: FeaturedMatchHeroProps) {
  const reducedMotion = usePreferencesStore((state) => state.reducedMotion);
  const participants = getMatchParticipants(match);
  const firstSource = match.sources[0];
  const poster = posterImageUrl(match);

  return (
    <section className="relative min-h-[calc(100vh-6.25rem)] overflow-hidden rounded-b-2xl border-b border-white/10">
      {poster ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgb(183_255_42_/_0.26),transparent_30%),radial-gradient(circle_at_78%_18%,rgb(20_55_216_/_0.35),transparent_38%),linear-gradient(90deg,rgb(7_9_11_/_0.98),rgb(7_9_11_/_0.72),rgb(7_9_11_/_0.95))]" />
      <div className="absolute inset-0 bg-signal-grid bg-[length:54px_54px] opacity-30" />
      <div className="container-page relative z-10 grid min-h-[calc(100vh-6.25rem)] items-center gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 flex flex-wrap gap-2">
            <CountdownChip date={match.date} />
            <Badge variant="cyan">{formatSportName(match.category)}</Badge>
            {match.popular ? <Badge variant="hot">Heat index rising</Badge> : null}
          </div>
          <h1 className="max-w-5xl text-balance font-display text-4xl font-black uppercase leading-[0.9] text-white sm:text-5xl md:text-7xl xl:text-8xl">
            {match.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/64 md:text-lg">
            Live source discovery, match pulse, stream quality, and team signal in one command surface.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {firstSource ? (
              <Button asChild size="lg">
                <Link href={`/watch/${encodeURIComponent(firstSource.source)}/${encodeURIComponent(firstSource.id)}`}>
                  <Radio className="h-5 w-5" aria-hidden="true" />
                  Watch now
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary" size="lg">
              <Link href={`/match/${encodeURIComponent(match.id)}`}>
                Match center
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-full bg-signal-lime/10 blur-3xl" />
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.065] p-5 shadow-panel backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <Badge variant="live">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Featured signal
              </Badge>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white/42">
                {match.sources.length} feeds
              </span>
            </div>
            <div className="my-10 flex items-center justify-center gap-2 sm:gap-5">
              <motion.div animate={reducedMotion ? {} : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                <TeamBadge name={participants.home} badge={match.teams?.home?.badge} className="h-20 w-20 text-lg sm:h-28 sm:w-28 sm:text-2xl" />
              </motion.div>
              <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 sm:px-4 sm:py-2 font-mono text-xs sm:text-sm font-black text-white/58">
                VS
              </div>
              <motion.div animate={reducedMotion ? {} : { y: [0, 8, 0] }} transition={{ duration: 5.5, repeat: Infinity }}>
                <TeamBadge name={participants.away} badge={match.teams?.away?.badge} className="h-20 w-20 text-lg sm:h-28 sm:w-28 sm:text-2xl" />
              </motion.div>
            </div>
            <MomentumMeter match={match} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
