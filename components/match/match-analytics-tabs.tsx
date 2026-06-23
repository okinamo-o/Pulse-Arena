"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Shield, Trophy, Activity } from "lucide-react";
import {
  ComprehensiveMatchData,
  BasketballStats,
  TennisStats,
  HockeyStats,
  BaseballStats,
  CricketStats,
  AmericanFootballStats,
} from "@/lib/streamed/types";
import { MatchStatsPanel } from "@/components/match/match-stats-panel";
import { MatchLineupsPanel } from "@/components/match/match-lineups-panel";
import { MatchStandingsPanel } from "@/components/match/match-standings-panel";
import { BasketballStatsPanel } from "@/components/match/sports/basketball-stats-panel";
import { TennisStatsPanel } from "@/components/match/sports/tennis-stats-panel";
import { HockeyStatsPanel } from "@/components/match/sports/hockey-stats-panel";
import { BaseballStatsPanel } from "@/components/match/sports/baseball-stats-panel";
import { CricketStatsPanel } from "@/components/match/sports/cricket-stats-panel";
import { AmericanFootballStatsPanel } from "@/components/match/sports/american-football-stats-panel";
import { SectionHeader } from "@/components/ui/section-header";

interface MatchAnalyticsTabsProps {
  homeTeam?: string;
  awayTeam?: string;
  category?: string;
}

type TabId = "lineups" | "stats" | "standings" | "score";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

function getTabsForSport(sportType?: string): TabDef[] {
  switch (sportType) {
    case "tennis":
      return [
        { id: "score", label: "Score", icon: Activity },
        { id: "stats", label: "Stats", icon: BarChart2 },
      ];
    case "basketball":
    case "hockey":
    case "american-football":
      return [
        { id: "stats", label: "Box Score", icon: BarChart2 },
        { id: "lineups", label: "Roster", icon: Shield },
        { id: "standings", label: "Standings", icon: Trophy },
      ];
    case "baseball":
      return [
        { id: "stats", label: "Line Score", icon: BarChart2 },
        { id: "lineups", label: "Roster", icon: Shield },
      ];
    case "cricket":
      return [
        { id: "stats", label: "Scorecard", icon: BarChart2 },
        { id: "lineups", label: "Squad", icon: Shield },
      ];
    default:
      // Football / unknown
      return [
        { id: "lineups", label: "Lineups", icon: Shield },
        { id: "stats", label: "Stats", icon: BarChart2 },
        { id: "standings", label: "Standings", icon: Trophy },
      ];
  }
}

export function MatchAnalyticsTabs({ homeTeam, awayTeam, category = "football" }: MatchAnalyticsTabsProps) {
  const { data, isLoading } = useQuery<ComprehensiveMatchData>({
    queryKey: ["streamed", "telemetry", homeTeam, awayTeam, category],
    queryFn: async () => {
      if (!homeTeam || !awayTeam) return null;
      const res = await fetch(
        `/api/stats?home=${encodeURIComponent(homeTeam)}&away=${encodeURIComponent(awayTeam)}&category=${encodeURIComponent(category)}`
      );
      if (res.status === 404) throw new Error("Match not found");
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      return res.json();
    },
    enabled: Boolean(homeTeam && awayTeam),
    refetchInterval: (query) => (query.state.error?.message === "Match not found" ? false : 5000),
    retry: (failureCount, err) => (err.message === "Match not found" ? false : failureCount < 3),
  });

  const sportType = data?.sportType || "unknown";
  const tabs = getTabsForSport(sportType !== "unknown" ? sportType : undefined);
  const [activeTab, setActiveTab] = React.useState<TabId>(tabs[0]?.id || "stats");

  // Reset tab when sportType changes
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.find((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [sportType, tabs, activeTab]);

  if (!homeTeam || !awayTeam) return null;

  const renderStatsPanel = () => {
    if (!data) return null;

    switch (data.sportType) {
      case "basketball":
        return data.sportStats ? (
          <BasketballStatsPanel stats={data.sportStats as BasketballStats} periods={data.periods} />
        ) : null;
      case "tennis":
        if (activeTab === "score") {
          return data.sportStats ? (
            <TennisStatsPanel stats={data.sportStats as TennisStats} periods={data.periods} />
          ) : null;
        }
        return data.sportStats ? (
          <TennisStatsPanel stats={data.sportStats as TennisStats} periods={data.periods} />
        ) : null;
      case "hockey":
        return data.sportStats ? (
          <HockeyStatsPanel stats={data.sportStats as HockeyStats} periods={data.periods} />
        ) : null;
      case "baseball":
        return data.sportStats ? (
          <BaseballStatsPanel stats={data.sportStats as BaseballStats} periods={data.periods} />
        ) : null;
      case "cricket":
        return data.sportStats ? (
          <CricketStatsPanel stats={data.sportStats as CricketStats} periods={data.periods} />
        ) : null;
      case "american-football":
        return data.sportStats ? (
          <AmericanFootballStatsPanel stats={data.sportStats as AmericanFootballStats} periods={data.periods} />
        ) : null;
      case "football":
      default:
        return data.stats ? <MatchStatsPanel stats={data.stats} /> : null;
    }
  };

  return (
    <div className="mt-16">
      <SectionHeader eyebrow="Deep Analytics" title="Match Dashboard" />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "lineups" && data?.lineups && (
          <MatchLineupsPanel home={data.lineups.home} away={data.lineups.away} />
        )}

        {(activeTab === "stats" || activeTab === "score") && renderStatsPanel()}

        {activeTab === "standings" && data?.standings && (
          <MatchStandingsPanel standings={data.standings} />
        )}

        {/* Loading / Empty States */}
        {!isLoading && !data && (
          <div className="flex items-center justify-center h-64 border border-white/10 border-dashed rounded-xl text-white/40">
            <p className="font-mono text-sm uppercase font-bold">Telemetry data unavailable for this match</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
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
