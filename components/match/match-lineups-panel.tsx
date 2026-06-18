"use client";

import * as React from "react";
import { Lineup } from "@/lib/streamed/types";
import { GlassPanel } from "@/components/ui/glass-panel";
import { User, Users } from "lucide-react";

export function MatchLineupsPanel({ home, away }: { home: Lineup; away: Lineup }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <LineupCard title="Home Team" lineup={home} tone="lime" />
      <LineupCard title="Away Team" lineup={away} tone="blue" />
    </div>
  );
}

function LineupCard({ title, lineup, tone }: { title: string; lineup: Lineup; tone: "lime" | "blue" }) {
  const highlight = tone === "lime" ? "text-signal-lime" : "text-signal-blue";

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <h3 className="text-xl font-black uppercase text-white">{title}</h3>
        <span className={`font-mono text-sm font-bold ${highlight}`}>{lineup.formation}</span>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
            <Users className="w-4 h-4" /> Starting XI
          </h4>
          <ul className="space-y-2">
            {lineup.startingXI.map((player) => (
              <li key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5">
                <span className={`font-mono text-xs font-bold w-6 text-center ${highlight}`}>{player.number}</span>
                <span className="font-bold text-white text-sm flex-1">{player.name}</span>
                <span className="text-xs font-bold uppercase text-white/40 w-8 text-right">{player.position}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
            <User className="w-4 h-4" /> Substitutes
          </h4>
          <ul className="space-y-2">
            {lineup.substitutes.map((player) => (
              <li key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/10 border border-white/5 opacity-80">
                <span className="font-mono text-xs font-bold w-6 text-center text-white/40">{player.number}</span>
                <span className="font-semibold text-white/80 text-sm flex-1">{player.name}</span>
                <span className="text-xs font-bold uppercase text-white/40 w-8 text-right">{player.position}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassPanel>
  );
}
