"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ComprehensiveMatchData } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamBadge } from "@/components/match/team-badge";

interface LiveScoreboardProps {
  homeTeam?: string;
  awayTeam?: string;
  homeBadge?: string;
  awayBadge?: string;
  matchDate: number;
}

export function LiveScoreboard({ homeTeam, awayTeam, homeBadge, awayBadge, matchDate }: LiveScoreboardProps) {
  const { data } = useQuery<ComprehensiveMatchData>({
    queryKey: ["streamed", "telemetry", homeTeam, awayTeam],
    queryFn: async () => {
      if (!homeTeam || !awayTeam) return null;
      const res = await fetch(`/api/stats?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}`);
      if (res.status === 404) throw new Error("Match not found");
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      return res.json();
    },
    enabled: Boolean(homeTeam && awayTeam),
    refetchInterval: (query) => query.state.error?.message === "Match not found" ? false : 5000,
    retry: (failureCount, err) => err.message === "Match not found" ? false : failureCount < 3,
  });

  const displayScore = data?.score ? `${data.score.home} - ${data.score.away}` : "- - -";
  const displayStatus = data?.score?.status || "AWAITING";

  return (
    <GlassPanel className="p-8 flex flex-col items-center justify-center">
      <p className="text-sm font-bold text-white/50 mb-6" suppressHydrationWarning>
        {new Date(matchDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
      <div className="flex items-center justify-center gap-12 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-4">
          <TeamBadge name={homeTeam} badge={homeBadge} size="xl" className="shadow-panel bg-white/5" />
          <span className="font-bold text-lg text-white">{homeTeam}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div 
            className="font-display font-black text-6xl text-white tracking-widest whitespace-nowrap"
            suppressHydrationWarning
          >
            {displayScore}
          </div>
          <span className="font-bold text-sm text-signal-lime uppercase tracking-widest mt-2">{displayStatus}</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <TeamBadge name={awayTeam} badge={awayBadge} size="xl" className="shadow-panel bg-white/5" />
          <span className="font-bold text-lg text-white">{awayTeam}</span>
        </div>
      </div>
    </GlassPanel>
  );
}
