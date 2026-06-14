"use client";

import * as React from "react";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import { usePreferencesStore } from "@/store/preferences-store";
import { useSports } from "@/hooks/use-streamed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";

export function SettingsView() {
  const { data: sports = [] } = useSports();
  const {
    reducedMotion,
    setReducedMotion,
    selectedSport,
    setSelectedSport,
    recentSearches,
    clearRecentSearches
  } = usePreferencesStore();

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      {/* Header section */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-panel backdrop-blur-2xl">
        <Badge variant="cyan">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          User Preferences
        </Badge>
        <h1 className="mt-5 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          System Control Deck
        </h1>
        <p className="mt-2 text-sm text-white/52">
          Configure interface options, defaults, and data retention settings.
        </p>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* General Preferences Panel */}
        <GlassPanel className="p-6">
          <h2 className="text-xl font-black uppercase tracking-wider text-white mb-6">
            Interface settings
          </h2>
          <div className="space-y-6">
            {/* Reduced motion toggle */}
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
              <div>
                <h3 className="font-bold text-white">Reduced Motion</h3>
                <p className="text-xs text-white/50 mt-1">
                  Minimize animations and transition durations across the dashboard.
                </p>
              </div>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-signal-lime focus:ring-offset-2 focus:ring-offset-graphite-950 ${
                  reducedMotion ? "bg-signal-lime" : "bg-white/10"
                }`}
                role="switch"
                aria-checked={reducedMotion}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-graphite-950 shadow ring-0 transition duration-200 ease-in-out ${
                    reducedMotion ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Default sport selection */}
            <div>
              <h3 className="font-bold text-white mb-2">Default Sport Filter</h3>
              <p className="text-xs text-white/50 mb-4">
                Select a sport to load by default when entering the sports directory.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={!selectedSport ? "default" : "secondary"}
                  onClick={() => setSelectedSport(undefined)}
                >
                  None (Show All)
                </Button>
                {sports.map((sport) => (
                  <Button
                    key={sport.id}
                    size="sm"
                    variant={selectedSport === sport.id ? "default" : "secondary"}
                    onClick={() => setSelectedSport(sport.id)}
                  >
                    {sport.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Data & History Panel */}
        <GlassPanel className="p-6">
          <h2 className="text-xl font-black uppercase tracking-wider text-white mb-6">
            Data & Privacy
          </h2>
          <div className="space-y-6">
            {/* Recent Searches */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-white">Search History</h3>
                  <p className="text-xs text-white/50 mt-1">
                    Your recent queries stored locally to power search suggestions.
                  </p>
                </div>
                {recentSearches.length > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-signal-red hover:bg-signal-red/10"
                    onClick={clearRecentSearches}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Clear all
                  </Button>
                )}
              </div>

              {recentSearches.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  {recentSearches.map((query, index) => (
                    <Badge key={index} variant="cyan" className="px-2.5 py-1 text-xs">
                      {query}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-white/38">
                  No search history recorded.
                </div>
              )}
            </div>

            {/* Info badge */}
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/72 mb-1.5">
                Local Storage Storage
              </h4>
              <p className="text-xs text-white/50 leading-relaxed">
                All preferences, favorites, and match reminder configurations are stored securely inside your browser&apos;s local storage. None of this data is sent to the server.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
