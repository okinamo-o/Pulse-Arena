"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/match/match-card";
import { useAllMatches, useSports } from "@/hooks/use-streamed";
import { formatSportName, sortByHeat } from "@/lib/streamed/selectors";
import { usePreferencesStore } from "@/store/preferences-store";

export function SearchView() {
  const [query, setQuery] = React.useState("");
  const [sport, setSport] = React.useState<string>("all");
  const { data: matches = [] } = useAllMatches();
  const { data: sports = [] } = useSports();
  const recentSearches = usePreferencesStore((state) => state.recentSearches);
  const pushRecentSearch = usePreferencesStore((state) => state.pushRecentSearch);

  const results = React.useMemo(() => {
    const clean = query.trim().toLowerCase();
    return sortByHeat(matches)
      .filter((match) => sport === "all" || match.category === sport)
      .filter((match) => {
        if (!clean) return true;
        const haystack = `${match.title} ${match.category} ${match.teams?.home?.name ?? ""} ${match.teams?.away?.name ?? ""}`.toLowerCase();
        return clean.split(/\s+/).every((part) => haystack.includes(part));
      })
      .slice(0, 48);
  }, [matches, query, sport]);

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-panel backdrop-blur-2xl md:p-8">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-signal-lime">
          <Search className="h-4 w-4" aria-hidden="true" />
          Elite search
        </div>
        <h1 className="mt-4 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          Find the exact match signal
        </h1>
        <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => pushRecentSearch(query)}
            placeholder="Search team, sport, competition, or source"
            className="h-14 text-base"
          />
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              className={`h-10 shrink-0 rounded-lg border px-3 text-xs font-bold uppercase tracking-[0.14em] ${
                sport === "all" ? "border-signal-lime bg-signal-lime text-graphite-950" : "border-white/10 bg-white/[0.08] text-white/80"
              }`}
              onClick={() => setSport("all")}
            >
              All
            </button>
            {sports.map((item) => (
              <button
                key={item.id}
                className={`h-10 shrink-0 rounded-lg border px-3 text-xs font-bold uppercase tracking-[0.14em] ${
                  sport === item.id
                    ? "border-signal-lime bg-signal-lime text-graphite-950"
                    : "border-white/10 bg-white/[0.08] text-white/80"
                }`}
                onClick={() => setSport(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        {!query && recentSearches.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button key={item} onClick={() => setQuery(item)}>
                <Badge variant="muted">{item}</Badge>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase text-white">{query ? "Search results" : "Trending searches"}</h2>
          <Badge variant="cyan">{results.length} matches</Badge>
        </div>
        {results.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-10 text-center text-white/72">
            No results for {query || formatSportName(sport)}.
          </div>
        )}
      </section>
    </main>
  );
}
