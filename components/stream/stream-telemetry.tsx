"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Goal, Square, ArrowRight, ArrowLeft, Activity } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ComprehensiveMatchData, MatchEvent } from "@/lib/streamed/types";
import { motion } from "framer-motion";
import { CountdownChip } from "@/components/match/countdown-chip";

interface StreamTelemetryProps {
  homeTeam?: string;
  awayTeam?: string;
  matchDate?: number;
}

export function StreamTelemetry({ homeTeam, awayTeam, matchDate }: StreamTelemetryProps) {
  // Use React Query to fetch the telemetry data
  const { data, isLoading, isError } = useQuery<ComprehensiveMatchData>({
    queryKey: ["streamed", "telemetry", homeTeam, awayTeam],
    queryFn: async () => {
      if (!homeTeam || !awayTeam) return [];
      const res = await fetch(`/api/stats?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}`);
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      return res.json();
    },
    enabled: Boolean(homeTeam && awayTeam),
    refetchInterval: 60000, // Refetch every minute
  });

  if (!homeTeam || !awayTeam) {
    return null;
  }

  const isPreMatch = matchDate ? Date.now() < matchDate : false;

  if (isPreMatch) {
    return (
      <GlassPanel className="p-4 relative overflow-hidden h-96">
        <div className="absolute inset-0 bg-signal-grid opacity-10" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center gap-4 text-center">
          <Activity className="h-8 w-8 text-white/20" />
          <div className="space-y-2">
            <p className="text-xs font-mono font-bold text-white/50">AWAITING KICKOFF</p>
            <h3 className="font-display font-black uppercase text-xl text-white/80">Telemetry Offline</h3>
          </div>
          <div className="mt-4">
            <CountdownChip date={matchDate!} />
          </div>
        </div>
      </GlassPanel>
    );
  }

  if (isLoading) {
    return (
      <GlassPanel className="p-4 relative overflow-hidden h-96">
        <div className="absolute inset-0 bg-signal-grid opacity-10" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center gap-4">
          <Activity className="h-8 w-8 text-signal-lime animate-pulse" />
          <p className="text-xs font-mono font-bold text-signal-lime animate-pulse">ESTABLISHING TELEMETRY LINK...</p>
        </div>
      </GlassPanel>
    );
  }

  const events = data?.events;

  if (isError || !events || events.length === 0) {
    return (
      <GlassPanel className="p-4 relative overflow-hidden h-96">
        <div className="absolute inset-0 bg-signal-grid opacity-10" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center gap-4 text-white/40">
          <Activity className="h-8 w-8" />
          <p className="text-xs font-mono font-bold uppercase">No telemetry feed available</p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-4 relative overflow-hidden min-h-[400px]">
      <div className="absolute inset-0 bg-signal-grid opacity-[0.03]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-signal-lime flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Match Telemetry
          </h2>
        </div>

        <div className="relative flex flex-col gap-6 py-4">
          {/* Central Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

          {events.map((event, i) => {
            const isHome = event.team === "home";

            return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center w-full"
              >
                {/* Home Side (Left) */}
                <div className={`flex-1 pr-6 flex flex-col justify-center text-right ${isHome ? 'opacity-100' : 'opacity-0 invisible'}`}>
                  {isHome && <EventDetails event={event} />}
                </div>

                {/* Central Minute Marker */}
                <div className="relative z-10 w-10 h-10 shrink-0 bg-black border border-white/20 rounded-full flex items-center justify-center font-mono text-xs font-bold text-white shadow-glow">
                  {event.minute}
                </div>

                {/* Away Side (Right) */}
                <div className={`flex-1 pl-6 flex flex-col justify-center text-left ${!isHome ? 'opacity-100' : 'opacity-0 invisible'}`}>
                  {!isHome && <EventDetails event={event} />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}

function EventDetails({ event }: { event: MatchEvent }) {
  const Icon = getEventIcon(event.type);
  const color = getEventColor(event.type);

  return (
    <div className={`flex flex-col ${event.team === 'home' ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 ${event.team === 'home' ? 'flex-row-reverse' : ''}`}>
        <div className={`flex shrink-0 ${color}`}>
          {Icon}
        </div>
        <span className="font-bold text-sm text-white truncate max-w-[120px]" title={event.primaryPlayer}>
          {event.primaryPlayer}
        </span>
      </div>
      
      {event.secondaryPlayer && (
        <span className="text-xs text-white/50 mt-0.5 truncate max-w-[120px]" title={event.secondaryPlayer}>
          {event.type === 'sub' ? `Out: ${event.secondaryPlayer}` : `Assist: ${event.secondaryPlayer}`}
        </span>
      )}
      
      {event.score && (
        <span className="font-mono text-signal-lime font-bold mt-1 bg-signal-lime/10 px-2 py-0.5 rounded border border-signal-lime/20">
          {event.score}
        </span>
      )}
    </div>
  );
}

function getEventIcon(type: MatchEvent["type"]) {
  switch (type) {
    case 'goal':
      return <Goal className="w-4 h-4" />;
    case 'yellow_card':
    case 'red_card':
      return <Square className="w-3.5 h-3.5 fill-current" />;
    case 'sub':
      return (
        <div className="flex -space-x-1">
          <ArrowRight className="w-3.5 h-3.5 text-signal-red" />
          <ArrowLeft className="w-3.5 h-3.5 text-signal-lime" />
        </div>
      );
  }
}

function getEventColor(type: MatchEvent["type"]) {
  switch (type) {
    case 'goal':
      return "text-signal-lime";
    case 'yellow_card':
      return "text-yellow-400";
    case 'red_card':
      return "text-red-500";
    case 'sub':
      return "text-white/60";
  }
}
