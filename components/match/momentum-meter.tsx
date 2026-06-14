"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getHeatScore } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";
import { cn } from "@/lib/utils/cn";

export function MomentumMeter({ match, compact = false }: { match: StreamedMatch; compact?: boolean }) {
  const score = getHeatScore(match);
  const label = score > 80 ? "Peak" : score > 62 ? "Hot" : score > 42 ? "Building" : "Calm";

  return (
    <div className={cn("rounded-xl border border-white/10 bg-black/20 p-4 shadow-inner-line", compact && "p-3")}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/58">
          <Zap className="h-4 w-4 text-signal-orange" aria-hidden="true" />
          Momentum
        </div>
        <span className="font-mono text-sm font-bold text-signal-orange">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-signal-cyan via-signal-lime to-signal-orange"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/42">
        <span>Signal</span>
        <span className="text-white/68">{label}</span>
      </div>
    </div>
  );
}
