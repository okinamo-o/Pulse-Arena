"use client";

import { BasketballStats, PeriodScore } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";

export function BasketballStatsPanel({ stats, periods }: { stats: BasketballStats; periods?: PeriodScore[] }) {
  return (
    <GlassPanel className="p-6 md:p-8">
      <h3 className="text-xl font-black uppercase text-white mb-8 border-b border-white/10 pb-4">
        🏀 Box Score
      </h3>

      {periods && periods.length > 0 && (
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-white/40">Team</th>
                {periods.map((p) => (
                  <th key={p.label} className="px-3 py-2 text-center text-xs font-bold uppercase text-orange-400/80">{p.label}</th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-bold uppercase text-orange-400">T</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-3 py-3 text-xs font-bold text-white/60 uppercase">Home</td>
                {periods.map((p) => (
                  <td key={p.label} className="px-3 py-3 text-center font-mono text-sm text-white/80">{p.home}</td>
                ))}
                <td className="px-3 py-3 text-center font-mono text-sm font-bold text-orange-400">
                  {periods.reduce((s, p) => s + (parseInt(p.home) || 0), 0)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-3 text-xs font-bold text-white/60 uppercase">Away</td>
                {periods.map((p) => (
                  <td key={p.label} className="px-3 py-3 text-center font-mono text-sm text-white/80">{p.away}</td>
                ))}
                <td className="px-3 py-3 text-center font-mono text-sm font-bold text-orange-400">
                  {periods.reduce((s, p) => s + (parseInt(p.away) || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <StatBar label="Field Goal %" home={stats.fieldGoalPct.home} away={stats.fieldGoalPct.away} suffix="%" color="orange" />
        <StatBar label="3-Point %" home={stats.threePointPct.home} away={stats.threePointPct.away} suffix="%" color="orange" />
        <StatBar label="Free Throw %" home={stats.freeThrowPct.home} away={stats.freeThrowPct.away} suffix="%" color="orange" />
        <StatBar label="Rebounds" home={stats.rebounds.home} away={stats.rebounds.away} color="orange" />
        <StatBar label="Assists" home={stats.assists.home} away={stats.assists.away} color="orange" />
        <StatBar label="Steals" home={stats.steals.home} away={stats.steals.away} color="orange" />
        <StatBar label="Blocks" home={stats.blocks.home} away={stats.blocks.away} color="orange" />
        <StatBar label="Turnovers" home={stats.turnovers.home} away={stats.turnovers.away} color="orange" invert />
      </div>
    </GlassPanel>
  );
}

function StatBar({ label, home, away, suffix = "", color = "orange", invert = false }: {
  label: string; home: number; away: number; suffix?: string; color?: string; invert?: boolean;
}) {
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;
  const awayPercent = total > 0 ? (away / total) * 100 : 50;
  const homeColor = color === "orange" ? "bg-orange-500" : "bg-signal-lime";
  const awayColor = "bg-cyan-500";

  return (
    <div>
      <div className="flex justify-between mb-2 text-sm font-bold text-white">
        <span>{home}{suffix}</span>
        <span className="uppercase tracking-[0.1em] text-white/50 text-xs">{label}</span>
        <span>{away}{suffix}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/10">
        <div className={`${homeColor} h-full transition-all duration-1000`} style={{ width: `${invert ? awayPercent : homePercent}%` }} />
        <div className={`${awayColor} h-full transition-all duration-1000`} style={{ width: `${invert ? homePercent : awayPercent}%` }} />
      </div>
    </div>
  );
}
