"use client";

import { AmericanFootballStats, PeriodScore } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";

export function AmericanFootballStatsPanel({ stats, periods }: { stats: AmericanFootballStats; periods?: PeriodScore[] }) {
  return (
    <GlassPanel className="p-6 md:p-8">
      <h3 className="text-xl font-black uppercase text-white mb-8 border-b border-white/10 pb-4">
        🏈 Box Score
      </h3>

      {periods && periods.length > 0 && (
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-white/40">Team</th>
                {periods.map((p) => (
                  <th key={p.label} className="px-3 py-2 text-center text-xs font-bold uppercase text-blue-400/80">{p.label}</th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-bold uppercase text-blue-400">T</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-3 py-3 text-xs font-bold text-white/60 uppercase">Home</td>
                {periods.map((p) => (
                  <td key={p.label} className="px-3 py-3 text-center font-mono text-sm text-white/80">{p.home}</td>
                ))}
                <td className="px-3 py-3 text-center font-mono text-sm font-bold text-blue-400">
                  {periods.reduce((s, p) => s + (parseInt(p.home) || 0), 0)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-3 text-xs font-bold text-white/60 uppercase">Away</td>
                {periods.map((p) => (
                  <td key={p.label} className="px-3 py-3 text-center font-mono text-sm text-white/80">{p.away}</td>
                ))}
                <td className="px-3 py-3 text-center font-mono text-sm font-bold text-blue-400">
                  {periods.reduce((s, p) => s + (parseInt(p.away) || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <StatBar label="Total Yards" home={stats.totalYards.home} away={stats.totalYards.away} />
        <StatBar label="Passing Yards" home={stats.passingYards.home} away={stats.passingYards.away} />
        <StatBar label="Rushing Yards" home={stats.rushingYards.home} away={stats.rushingYards.away} />
        <StatBar label="First Downs" home={stats.firstDowns.home} away={stats.firstDowns.away} />
        <StatBar label="Sacks" home={stats.sacks.home} away={stats.sacks.away} />
        <StatBar label="Turnovers" home={stats.turnovers.home} away={stats.turnovers.away} invert />
        
        <div className="mt-2 border-t border-white/10 pt-4">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-white">{stats.timeOfPossession.home}</span>
            <span className="uppercase tracking-[0.1em] text-white/50 text-xs">Time of Possession</span>
            <span className="font-bold text-white">{stats.timeOfPossession.away}</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

function StatBar({ label, home, away, invert = false }: {
  label: string; home: number; away: number; invert?: boolean;
}) {
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;

  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-bold text-white">
        <span>{home}</span>
        <span className="uppercase tracking-[0.1em] text-white/50 text-xs">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/10">
        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${invert ? 100 - homePercent : homePercent}%` }} />
        <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${invert ? homePercent : 100 - homePercent}%` }} />
      </div>
    </div>
  );
}
