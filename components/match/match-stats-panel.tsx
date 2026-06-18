"use client";

import * as React from "react";
import { MatchStats } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";

export function MatchStatsPanel({ stats }: { stats: MatchStats }) {
  return (
    <GlassPanel className="p-6 md:p-8">
      <h3 className="text-xl font-black uppercase text-white mb-8 border-b border-white/10 pb-4">Match Statistics</h3>
      <div className="flex flex-col gap-6">
        <StatBar label="Ball Possession" home={stats.possession.home} away={stats.possession.away} suffix="%" />
        <StatBar label="Shots on Target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
        <StatBar label="Shots off Target" home={stats.shotsOffTarget.home} away={stats.shotsOffTarget.away} />
        <StatBar label="Corner Kicks" home={stats.corners.home} away={stats.corners.away} />
        <StatBar label="Fouls" home={stats.fouls.home} away={stats.fouls.away} />
        <StatBar label="Yellow Cards" home={stats.yellowCards.home} away={stats.yellowCards.away} />
        <StatBar label="Red Cards" home={stats.redCards.home} away={stats.redCards.away} />
      </div>
    </GlassPanel>
  );
}

function StatBar({ label, home, away, suffix = "" }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away;
  // Handle edge case where total is 0 to avoid NaN width
  const homePercent = total > 0 ? (home / total) * 100 : 50;
  const awayPercent = total > 0 ? (away / total) * 100 : 50;

  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-bold text-white">
        <span>{home}{suffix}</span>
        <span className="uppercase tracking-[0.1em] text-white/50 text-xs">{label}</span>
        <span>{away}{suffix}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/10">
        <div className="bg-signal-lime h-full transition-all duration-1000" style={{ width: `${homePercent}%` }} />
        <div className="bg-signal-blue h-full transition-all duration-1000" style={{ width: `${awayPercent}%` }} />
      </div>
    </div>
  );
}
