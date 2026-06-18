"use client";

import * as React from "react";
import { StandingsRow } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";

export function MatchStandingsPanel({ standings }: { standings: StandingsRow[] }) {
  return (
    <GlassPanel className="p-6 md:p-8 overflow-x-auto">
      <h3 className="text-xl font-black uppercase text-white mb-6">Competition Form</h3>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-white/50 uppercase font-bold border-b border-white/10">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3 text-center">PL</th>
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">D</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center">GD</th>
            <th className="px-4 py-3 text-center">PTS</th>
            <th className="px-4 py-3 text-center">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr key={row.team} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-4 font-mono text-signal-cyan">{row.position}</td>
              <td className="px-4 py-4 font-bold text-white whitespace-nowrap">{row.team}</td>
              <td className="px-4 py-4 text-center text-white/70">{row.played}</td>
              <td className="px-4 py-4 text-center text-white/70">{row.won}</td>
              <td className="px-4 py-4 text-center text-white/70">{row.drawn}</td>
              <td className="px-4 py-4 text-center text-white/70">{row.lost}</td>
              <td className="px-4 py-4 text-center text-white/70">{row.goalDifference}</td>
              <td className="px-4 py-4 text-center font-bold text-signal-lime">{row.points}</td>
              <td className="px-4 py-4">
                <div className="flex justify-center gap-1">
                  {row.form.map((f, i) => (
                    <span 
                      key={i} 
                      className={`flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded ${
                        f === 'W' ? 'bg-signal-lime/20 text-signal-lime' : 
                        f === 'L' ? 'bg-red-500/20 text-red-500' : 
                        'bg-white/10 text-white'
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassPanel>
  );
}
