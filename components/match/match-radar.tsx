"use client";

import { Activity } from "lucide-react";
import type { StreamedMatch } from "@/lib/streamed/types";
import { getHeatScore } from "@/lib/streamed/selectors";

export function MatchRadar({ match }: { match: StreamedMatch }) {
  const heat = getHeatScore(match);
  const blips = Array.from({ length: Math.max(4, Math.ceil(heat / 14)) });

  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-white/10 bg-graphite-950/70 p-5 shadow-inner-line">
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal-lime">Match radar</p>
          <h3 className="mt-1 text-xl font-black uppercase text-white">Live activity field</h3>
        </div>
        <Activity className="h-5 w-5 text-signal-cyan" aria-hidden="true" />
      </div>
      <div className="absolute left-1/2 top-[58%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal-lime/25">
        <div className="absolute inset-8 rounded-full border border-signal-cyan/20" />
        <div className="absolute inset-16 rounded-full border border-signal-orange/18" />
        <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom animate-radar-spin bg-gradient-to-t from-signal-lime to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-white/8" />
        <div className="absolute left-1/2 top-1/2 h-full w-px -translate-y-1/2 bg-white/8" />
        {blips.map((_, index) => {
          const top = 24 + ((index * 37 + heat) % 54);
          const left = 18 + ((index * 29 + heat) % 64);
          const hot = index % 3 === 0;
          return (
            <span
              key={index}
              className={hot ? "absolute h-2.5 w-2.5 rounded-full bg-signal-orange shadow-glow-orange" : "absolute h-2 w-2 rounded-full bg-signal-lime shadow-glow"}
              style={{ top: `${top}%`, left: `${left}%` }}
            />
          );
        })}
      </div>
      <div className="absolute bottom-5 left-5 right-5 z-10 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2">
          <p className="font-mono text-lg font-black text-signal-lime">{heat}</p>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/42">Heat</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2">
          <p className="font-mono text-lg font-black text-signal-cyan">{match.sources.length}</p>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/42">Feeds</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2">
          <p className="font-mono text-lg font-black text-signal-orange">{match.popular ? "HOT" : "ON"}</p>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/42">Trend</p>
        </div>
      </div>
    </div>
  );
}
