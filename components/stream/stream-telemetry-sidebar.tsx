"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock } from "lucide-react";
import { ComprehensiveMatchData, StreamedMatch } from "@/lib/streamed/types";
import { getMatchParticipants } from "@/lib/streamed/selectors";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamBadge } from "@/components/match/team-badge";

export function StreamTelemetrySidebar({ match }: { match?: StreamedMatch }) {
  const participants = match ? getMatchParticipants(match) : null;
  const homeTeam = participants?.home;
  const awayTeam = participants?.away;

  const { data } = useQuery<ComprehensiveMatchData>({
    queryKey: ["streamed", "telemetry", homeTeam, awayTeam],
    queryFn: async () => {
      if (!homeTeam || !awayTeam) return null;
      const res = await fetch(`/api/stats?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}`);
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      return res.json();
    },
    enabled: Boolean(homeTeam && awayTeam),
    refetchInterval: 10000,
  });

  const displayScore = data?.score ? `${data.score.home} - ${data.score.away}` : "0 - 0";
  const displayStatus = data?.score?.status || "AWAITING";

  if (!match) return null;

  return (
    <GlassPanel className="p-4 flex flex-col h-fit bg-graphite-950/80">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 text-signal-lime">
        <Activity className="h-4 w-4" />
        <h3 className="font-display text-[0.8rem] font-black uppercase tracking-widest text-white">Live Telemetry</h3>
      </div>

      <div className="flex flex-col items-center mb-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-center gap-1.5 w-[35%]">
            <TeamBadge name={homeTeam || ""} badge={match.teams?.home?.badge} size="md" />
            <span className="font-bold text-[0.6rem] text-center uppercase text-white/70 line-clamp-2">{homeTeam}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center w-[30%]">
            <div className="font-display font-black text-2xl text-white tracking-wider whitespace-nowrap" suppressHydrationWarning>
              {displayScore}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-signal-orange">
              <Clock className="h-3 w-3" />
              <span className="font-bold text-[0.6rem] uppercase tracking-widest">{displayStatus}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-[35%]">
            <TeamBadge name={awayTeam || ""} badge={match.teams?.away?.badge} size="md" />
            <span className="font-bold text-[0.6rem] text-center uppercase text-white/70 line-clamp-2">{awayTeam}</span>
          </div>
        </div>
      </div>

      {data?.stats ? (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="Possession" home={data.stats.possession.home} away={data.stats.possession.away} suffix="%" />
          <StatBar label="Shots on Target" home={data.stats.shotsOnTarget.home} away={data.stats.shotsOnTarget.away} />
          <StatBar label="Shots off Target" home={data.stats.shotsOffTarget.home} away={data.stats.shotsOffTarget.away} />
          <StatBar label="Corners" home={data.stats.corners.home} away={data.stats.corners.away} />
          <StatBar label="Yellow Cards" home={data.stats.yellowCards.home} away={data.stats.yellowCards.away} />
          <StatBar label="Red Cards" home={data.stats.redCards.home} away={data.stats.redCards.away} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center mt-4 border-t border-white/5">
          <Activity className="h-6 w-6 text-white/10 mb-2 animate-pulse" />
          <p className="text-[0.65rem] text-white/40 uppercase tracking-wider font-bold">Awaiting Data</p>
        </div>
      )}
    </GlassPanel>
  );
}

function StatBar({ label, home, away, suffix = "" }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;
  const awayPercent = total > 0 ? (away / total) * 100 : 50;

  return (
    <div>
      <div className="flex justify-between mb-1.5 text-[0.68rem] font-bold text-white">
        <span>{home}{suffix}</span>
        <span className="uppercase tracking-[0.1em] text-white/40 text-[0.6rem]">{label}</span>
        <span>{away}{suffix}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
        <div className="bg-signal-lime h-full transition-all duration-1000" style={{ width: `${homePercent}%` }} />
        <div className="bg-signal-blue h-full transition-all duration-1000" style={{ width: `${awayPercent}%` }} />
      </div>
    </div>
  );
}
