"use client";

import * as React from "react";
import { Flame, Radio, Clock } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { StreamedMatch } from "@/lib/streamed/types";
import { getMatchStatus } from "@/lib/streamed/selectors";

interface ScheduleHeroProps {
  matches: StreamedMatch[];
}

export function ScheduleHero({ matches }: ScheduleHeroProps) {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Compute counts
  const liveCount = React.useMemo(() => {
    return matches.filter((m) => getMatchStatus(m, now) === "live").length;
  }, [matches, now]);

  const upcomingCount = React.useMemo(() => {
    return matches.filter((m) => getMatchStatus(m, now) === "upcoming").length;
  }, [matches, now]);

  // Find next kickoff match
  const nextMatch = React.useMemo(() => {
    const future = matches
      .filter((m) => getMatchStatus(m, now) === "upcoming")
      .sort((a, b) => a.date - b.date);
    return future[0] || null;
  }, [matches, now]);

  // Live countdown formatting
  const countdownText = React.useMemo(() => {
    if (!nextMatch) return "No matches scheduled";
    const diff = nextMatch.date - now;
    if (diff <= 0) return "Starting now...";
    
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    const s = String(secs % 60).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    const h = String(hours % 24).padStart(2, "0");

    if (days > 0) {
      return `${days}d ${h}h ${m}m ${s}s`;
    }
    return `${h}:${m}:${s}`;
  }, [nextMatch, now]);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-graphite-950 pb-16 pt-32">
      {/* Animated background lines & grids */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-signal-grid opacity-[0.03] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" />
        <div className="absolute left-[18%] top-[12%] h-[320px] w-[320px] rounded-full bg-signal-lime/10 blur-[100px] animate-float" />
        <div className="absolute right-[22%] top-[24%] h-[280px] w-[280px] rounded-full bg-signal-cyan/8 blur-[90px] animate-float [animation-delay:2s]" />
      </div>

      <div className="container-page relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Main Title & Brand Identity */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-signal-lime/30 bg-signal-lime/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-signal-lime shadow-glow">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-lime opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-lime"></span>
              </span>
              Signal Command Center
            </div>
            
            <h1 className="text-balance font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
              Sports <span className="bg-gradient-to-r from-signal-lime via-signal-cyan to-signal-orange bg-clip-text text-transparent">Schedule</span>
            </h1>
            
            <p className="max-w-xl text-sm font-semibold leading-relaxed text-white/54">
              Real-time monitoring across all arenas. Track upcoming signals, schedule push alerts, and sync live feeds directly to your local workspace calendar.
            </p>
          </div>

          {/* Metrics Panel */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:w-[540px]">
            <GlassPanel className="relative p-4 overflow-hidden border-signal-lime/20 bg-signal-lime/[0.02] shadow-glow">
              <div className="flex items-center justify-between text-signal-lime">
                <Radio className="h-5 w-5 animate-pulse-live" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">Live</span>
              </div>
              <p className="mt-4 font-mono text-4xl font-black text-white">{liveCount}</p>
              <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/40">Active Signals</p>
            </GlassPanel>

            <GlassPanel className="p-4">
              <div className="flex items-center justify-between text-signal-cyan">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">Upcoming</span>
              </div>
              <p className="mt-4 font-mono text-4xl font-black text-white">{upcomingCount}</p>
              <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/40">Future Matches</p>
            </GlassPanel>

            <GlassPanel className="col-span-2 sm:col-span-1 p-4 border-signal-orange/20 bg-signal-orange/[0.01]">
              <div className="flex items-center justify-between text-signal-orange">
                <Flame className="h-5 w-5" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">Countdown</span>
              </div>
              <div className="mt-4 h-9 flex items-center">
                <p className="font-mono text-lg font-black text-white tracking-tight leading-none truncate w-full">
                  {countdownText}
                </p>
              </div>
              <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/40">
                {nextMatch ? `VS ${nextMatch.title.slice(0, 15)}...` : "Kickoff Watch"}
              </p>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
}
