"use client";

import { BaseballStats, PeriodScore } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";

export function BaseballStatsPanel({ stats, periods }: { stats: BaseballStats; periods?: PeriodScore[] }) {
  return (
    <GlassPanel className="p-6 md:p-8">
      <h3 className="text-xl font-black uppercase text-white mb-8 border-b border-white/10 pb-4">
        ⚾ Line Score
      </h3>

      {periods && periods.length > 0 && (
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-2 py-2 text-left text-xs font-bold uppercase text-white/40">Team</th>
                {periods.map((p) => (
                  <th key={p.label} className="px-2 py-2 text-center text-xs font-bold uppercase text-amber-500/80 w-8">{p.label}</th>
                ))}
                <th className="px-2 py-2 text-center text-xs font-bold uppercase text-amber-500 border-l border-white/10">R</th>
                <th className="px-2 py-2 text-center text-xs font-bold uppercase text-amber-500">H</th>
                <th className="px-2 py-2 text-center text-xs font-bold uppercase text-amber-500">E</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-2 py-3 text-xs font-bold text-white/60 uppercase">Home</td>
                {periods.map((p) => (
                  <td key={p.label} className="px-2 py-3 text-center font-mono text-sm text-white/80">{p.home}</td>
                ))}
                <td className="px-2 py-3 text-center font-mono text-sm font-bold text-amber-400 border-l border-white/10">{stats.runs.home}</td>
                <td className="px-2 py-3 text-center font-mono text-sm font-bold text-white">{stats.hits.home}</td>
                <td className="px-2 py-3 text-center font-mono text-sm font-bold text-red-400">{stats.errors.home}</td>
              </tr>
              <tr>
                <td className="px-2 py-3 text-xs font-bold text-white/60 uppercase">Away</td>
                {periods.map((p) => (
                  <td key={p.label} className="px-2 py-3 text-center font-mono text-sm text-white/80">{p.away}</td>
                ))}
                <td className="px-2 py-3 text-center font-mono text-sm font-bold text-amber-400 border-l border-white/10">{stats.runs.away}</td>
                <td className="px-2 py-3 text-center font-mono text-sm font-bold text-white">{stats.hits.away}</td>
                <td className="px-2 py-3 text-center font-mono text-sm font-bold text-red-400">{stats.errors.away}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <StatBar label="Home Runs" home={stats.homeRuns.home} away={stats.homeRuns.away} />
        <StatBar label="RBI" home={stats.rbi.home} away={stats.rbi.away} />
        <StatBar label="Batting Avg" home={stats.battingAvg.home} away={stats.battingAvg.away} />
      </div>
    </GlassPanel>
  );
}

function StatBar({ label, home, away, suffix = "" }: {
  label: string; home: number; away: number; suffix?: string;
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
        <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${homePercent}%` }} />
        <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${100 - homePercent}%` }} />
      </div>
    </div>
  );
}
