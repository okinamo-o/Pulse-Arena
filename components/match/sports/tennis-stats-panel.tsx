"use client";

import { TennisStats, PeriodScore } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";

export function TennisStatsPanel({ stats, periods }: { stats: TennisStats; periods?: PeriodScore[] }) {
  return (
    <GlassPanel className="p-6 md:p-8">
      <h3 className="text-xl font-black uppercase text-white mb-8 border-b border-white/10 pb-4">
        🎾 Match Score
      </h3>

      {periods && periods.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {periods.map((p) => (
              <div key={p.label} className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 mb-2">{p.label}</span>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-mono text-lg font-bold text-white">
                    {p.home}
                  </span>
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 font-mono text-lg font-bold text-white/70">
                    {p.away}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3 gap-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">Player 1</span>
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Player 2</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 mt-6">
        <StatRow label="Aces" home={stats.aces.home} away={stats.aces.away} />
        <StatRow label="Double Faults" home={stats.doubleFaults.home} away={stats.doubleFaults.away} invert />
        <StatRow label="1st Serve %" home={stats.firstServePct.home} away={stats.firstServePct.away} suffix="%" />
        <StatRow label="Break Points Won" home={stats.breakPointsWon.home} away={stats.breakPointsWon.away} />
        <StatRow label="Winners" home={stats.winners.home} away={stats.winners.away} />
        <StatRow label="Unforced Errors" home={stats.unforcedErrors.home} away={stats.unforcedErrors.away} invert />
      </div>
    </GlassPanel>
  );
}

function StatRow({ label, home, away, suffix = "", invert = false }: {
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
      <div className="flex h-2 rounded-full overflow-hidden bg-white/10">
        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${invert ? 100 - homePercent : homePercent}%` }} />
        <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${invert ? homePercent : 100 - homePercent}%` }} />
      </div>
    </div>
  );
}
