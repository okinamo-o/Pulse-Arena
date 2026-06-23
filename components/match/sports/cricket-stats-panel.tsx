"use client";

import { CricketStats, PeriodScore } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";

export function CricketStatsPanel({ stats, periods }: { stats: CricketStats; periods?: PeriodScore[] }) {
  return (
    <GlassPanel className="p-6 md:p-8">
      <h3 className="text-xl font-black uppercase text-white mb-8 border-b border-white/10 pb-4">
        🏏 Scorecard
      </h3>

      {periods && periods.length > 0 && (
        <div className="grid gap-3 mb-8">
          {periods.map((p) => (
            <div key={p.label} className="flex items-center justify-between rounded-lg border border-green-500/10 bg-green-500/5 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">{p.label}</span>
              <div className="flex gap-6">
                <span className="font-mono text-sm font-bold text-white">{p.home}</span>
                <span className="text-white/30">vs</span>
                <span className="font-mono text-sm font-bold text-white/70">{p.away}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <StatBar label="Runs" home={stats.runs.home} away={stats.runs.away} />
        <StatBar label="Wickets" home={stats.wickets.home} away={stats.wickets.away} invert />
        <StatBar label="Overs" home={stats.overs.home} away={stats.overs.away} />
        <StatBar label="Run Rate" home={stats.runRate.home} away={stats.runRate.away} />
        <StatBar label="Boundaries" home={stats.boundaries.home} away={stats.boundaries.away} />
        <StatBar label="Extras" home={stats.extras.home} away={stats.extras.away} invert />
      </div>
    </GlassPanel>
  );
}

function StatBar({ label, home, away, suffix = "", invert = false }: {
  label: string; home: number; away: number; suffix?: string; invert?: boolean;
}) {
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;

  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-bold text-white">
        <span>{home}{suffix}</span>
        <span className="uppercase tracking-[0.1em] text-white/50 text-xs">{label}</span>
        <span>{away}{suffix}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/10">
        <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${invert ? 100 - homePercent : homePercent}%` }} />
        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${invert ? homePercent : 100 - homePercent}%` }} />
      </div>
    </div>
  );
}
