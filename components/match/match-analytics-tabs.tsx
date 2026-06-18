"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Shield, Trophy } from "lucide-react";
import { ComprehensiveMatchData } from "@/lib/streamed/types";
import { MatchStatsPanel } from "@/components/match/match-stats-panel";
import { MatchLineupsPanel } from "@/components/match/match-lineups-panel";
import { MatchStandingsPanel } from "@/components/match/match-standings-panel";
import { SectionHeader } from "@/components/ui/section-header";

export function MatchAnalyticsTabs({ homeTeam, awayTeam }: { homeTeam?: string; awayTeam?: string }) {
  const [activeTab, setActiveTab] = React.useState<"lineups" | "stats" | "standings">("lineups");

  const { data, isLoading } = useQuery<ComprehensiveMatchData>({
    queryKey: ["streamed", "telemetry", homeTeam, awayTeam],
    queryFn: async () => {
      if (!homeTeam || !awayTeam) return null;
      const res = await fetch(`/api/stats?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}`);
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      return res.json();
    },
    enabled: Boolean(homeTeam && awayTeam),
    refetchInterval: 5000,
  });

  if (!homeTeam || !awayTeam) return null;

  return (
    <div className="mt-16">
      <SectionHeader eyebrow="Deep Analytics" title="Match Dashboard" />
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        <TabButton 
          active={activeTab === "lineups"} 
          onClick={() => setActiveTab("lineups")} 
          icon={Shield} 
          label="Lineups" 
        />
        <TabButton 
          active={activeTab === "stats"} 
          onClick={() => setActiveTab("stats")} 
          icon={BarChart2} 
          label="Stats" 
        />
        <TabButton 
          active={activeTab === "standings"} 
          onClick={() => setActiveTab("standings")} 
          icon={Trophy} 
          label="Standings" 
        />
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        
        {activeTab === "lineups" && data?.lineups && (
          <MatchLineupsPanel home={data.lineups.home} away={data.lineups.away} />
        )}
        
        {activeTab === "stats" && data?.stats && (
          <MatchStatsPanel stats={data.stats} />
        )}

        {activeTab === "standings" && data?.standings && (
          <MatchStandingsPanel standings={data.standings} />
        )}

        {/* Loading / Empty States */}
        {!isLoading && !data?.[activeTab] && (
          <div className="flex items-center justify-center h-64 border border-white/10 border-dashed rounded-xl text-white/40">
            <p className="font-mono text-sm uppercase font-bold">No {activeTab} data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
        active 
          ? "bg-signal-lime text-black shadow-glow" 
          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
