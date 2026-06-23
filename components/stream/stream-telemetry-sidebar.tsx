/* eslint-disable @typescript-eslint/no-explicit-any */
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
      const categoryParam = match?.category ? `&category=${encodeURIComponent(match.category)}` : "";
      const res = await fetch(`/api/stats?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}${categoryParam}`);
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      return res.json();
    },
    enabled: Boolean(homeTeam && awayTeam),
    refetchInterval: 5000,
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

      {data?.sportType === "basketball" && data.sportStats && (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="FG%" home={(data.sportStats as any).fieldGoalPct.home} away={(data.sportStats as any).fieldGoalPct.away} suffix="%" color="orange" />
          <StatBar label="3PT%" home={(data.sportStats as any).threePointPct.home} away={(data.sportStats as any).threePointPct.away} suffix="%" color="orange" />
          <StatBar label="Rebounds" home={(data.sportStats as any).rebounds.home} away={(data.sportStats as any).rebounds.away} color="orange" />
          <StatBar label="Assists" home={(data.sportStats as any).assists.home} away={(data.sportStats as any).assists.away} color="orange" />
          <StatBar label="Turnovers" home={(data.sportStats as any).turnovers.home} away={(data.sportStats as any).turnovers.away} color="orange" invert />
        </div>
      )}

      {data?.sportType === "tennis" && data.sportStats && (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="Aces" home={(data.sportStats as any).aces.home} away={(data.sportStats as any).aces.away} color="emerald" />
          <StatBar label="Double Faults" home={(data.sportStats as any).doubleFaults.home} away={(data.sportStats as any).doubleFaults.away} color="emerald" invert />
          <StatBar label="1st Serve %" home={(data.sportStats as any).firstServePct.home} away={(data.sportStats as any).firstServePct.away} suffix="%" color="emerald" />
          <StatBar label="Break Points" home={(data.sportStats as any).breakPointsWon.home} away={(data.sportStats as any).breakPointsWon.away} color="emerald" />
        </div>
      )}

      {data?.sportType === "hockey" && data.sportStats && (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="Shots" home={(data.sportStats as any).shots.home} away={(data.sportStats as any).shots.away} color="sky" />
          <StatBar label="Power Play %" home={(data.sportStats as any).powerPlayPct.home} away={(data.sportStats as any).powerPlayPct.away} suffix="%" color="sky" />
          <StatBar label="Saves" home={(data.sportStats as any).saves.home} away={(data.sportStats as any).saves.away} color="sky" />
          <StatBar label="Hits" home={(data.sportStats as any).hits.home} away={(data.sportStats as any).hits.away} color="sky" />
        </div>
      )}

      {data?.sportType === "baseball" && data.sportStats && (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="Hits" home={(data.sportStats as any).hits.home} away={(data.sportStats as any).hits.away} color="amber" />
          <StatBar label="Errors" home={(data.sportStats as any).errors.home} away={(data.sportStats as any).errors.away} color="amber" invert />
          <StatBar label="Home Runs" home={(data.sportStats as any).homeRuns.home} away={(data.sportStats as any).homeRuns.away} color="amber" />
          <StatBar label="Batting Avg" home={(data.sportStats as any).battingAvg.home} away={(data.sportStats as any).battingAvg.away} color="amber" />
        </div>
      )}

      {data?.sportType === "cricket" && data.sportStats && (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="Wickets" home={(data.sportStats as any).wickets.home} away={(data.sportStats as any).wickets.away} color="green" invert />
          <StatBar label="Overs" home={(data.sportStats as any).overs.home} away={(data.sportStats as any).overs.away} color="green" />
          <StatBar label="Run Rate" home={(data.sportStats as any).runRate.home} away={(data.sportStats as any).runRate.away} color="green" />
          <StatBar label="Boundaries" home={(data.sportStats as any).boundaries.home} away={(data.sportStats as any).boundaries.away} color="green" />
        </div>
      )}

      {data?.sportType === "american-football" && data.sportStats && (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="Total Yards" home={(data.sportStats as any).totalYards.home} away={(data.sportStats as any).totalYards.away} color="blue" />
          <StatBar label="Pass Yards" home={(data.sportStats as any).passingYards.home} away={(data.sportStats as any).passingYards.away} color="blue" />
          <StatBar label="Rush Yards" home={(data.sportStats as any).rushingYards.home} away={(data.sportStats as any).rushingYards.away} color="blue" />
          <StatBar label="Turnovers" home={(data.sportStats as any).turnovers.home} away={(data.sportStats as any).turnovers.away} color="blue" invert />
        </div>
      )}

      {data?.sportType === "football" && data.stats && (
        <div className="flex flex-col gap-3 mt-4">
          <StatBar label="Possession" home={data.stats.possession.home} away={data.stats.possession.away} suffix="%" />
          <StatBar label="Shots on Target" home={data.stats.shotsOnTarget.home} away={data.stats.shotsOnTarget.away} />
          <StatBar label="Shots off Target" home={data.stats.shotsOffTarget.home} away={data.stats.shotsOffTarget.away} />
          <StatBar label="Corners" home={data.stats.corners.home} away={data.stats.corners.away} />
          <StatBar label="Yellow Cards" home={data.stats.yellowCards.home} away={data.stats.yellowCards.away} />
          <StatBar label="Red Cards" home={data.stats.redCards.home} away={data.stats.redCards.away} />
        </div>
      )}

      {!data?.stats && !data?.sportStats && (
        <div className="flex flex-col items-center justify-center py-6 text-center mt-4 border-t border-white/5">
          <Activity className="h-6 w-6 text-white/10 mb-2 animate-pulse" />
          <p className="text-[0.65rem] text-white/40 uppercase tracking-wider font-bold">Awaiting Data</p>
        </div>
      )}
    </GlassPanel>
  );
}

function StatBar({ label, home, away, suffix = "", color = "lime", invert = false }: { 
  label: string; home: number; away: number; suffix?: string; color?: string; invert?: boolean;
}) {
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;
  
  const getColors = () => {
    switch (color) {
      case "orange": return { h: "bg-orange-500", a: "bg-cyan-500" };
      case "emerald": return { h: "bg-emerald-500", a: "bg-yellow-500" };
      case "sky": return { h: "bg-sky-400", a: "bg-red-400" };
      case "amber": return { h: "bg-amber-500", a: "bg-red-500" };
      case "green": return { h: "bg-green-500", a: "bg-blue-500" };
      case "blue": return { h: "bg-blue-500", a: "bg-red-500" };
      default: return { h: "bg-signal-lime", a: "bg-signal-blue" };
    }
  };
  
  const colors = getColors();

  return (
    <div>
      <div className="flex justify-between mb-1.5 text-[0.68rem] font-bold text-white">
        <span>{home}{suffix}</span>
        <span className="uppercase tracking-[0.1em] text-white/40 text-[0.6rem]">{label}</span>
        <span>{away}{suffix}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
        <div className={`${colors.h} h-full transition-all duration-1000`} style={{ width: `${invert ? 100 - homePercent : homePercent}%` }} />
        <div className={`${colors.a} h-full transition-all duration-1000`} style={{ width: `${invert ? homePercent : 100 - homePercent}%` }} />
      </div>
    </div>
  );
}
