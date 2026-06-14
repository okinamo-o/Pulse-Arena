"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAllMatches } from "@/hooks/use-streamed";
import { formatSportName, sortByHeat } from "@/lib/streamed/selectors";
import { usePreferencesStore } from "@/store/preferences-store";

interface SearchCommandProps {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>;
}

export function SearchCommand({ children }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { data = [] } = useAllMatches();
  const recentSearches = usePreferencesStore((state) => state.recentSearches);
  const pushRecentSearch = usePreferencesStore((state) => state.pushRecentSearch);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.key === "/" && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  const results = React.useMemo(() => {
    const clean = query.trim().toLowerCase();
    const pool = sortByHeat(data);
    if (!clean) return pool.slice(0, 8);
    return pool
      .filter((match) => {
        const haystack = `${match.title} ${match.category} ${match.teams?.home?.name ?? ""} ${match.teams?.away?.name ?? ""}`.toLowerCase();
        return clean.split(/\s+/).every((part) => haystack.includes(part));
      })
      .slice(0, 10);
  }, [data, query]);

  const trigger = React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      setOpen(true);
    }
  });

  return (
    <>
      {trigger}
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-3 backdrop-blur-xl" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" aria-label="Close search" onClick={() => setOpen(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-graphite-900/96 shadow-panel">
            <div className="flex items-center gap-3 border-b border-white/10 p-3">
              <Search className="h-5 w-5 text-signal-lime" aria-hidden="true" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search teams, sports, or live events"
                className="border-0 bg-transparent text-base shadow-none focus:ring-0"
              />
              <Button size="icon" variant="ghost" aria-label="Close search" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            {!query && recentSearches.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3">
                {recentSearches.slice(0, 5).map((item) => (
                  <button
                    key={item}
                    className="rounded-md border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:text-white"
                    onClick={() => setQuery(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="max-h-[62vh] overflow-y-auto p-2">
              {results.map((match) => (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="grid gap-2 rounded-lg p-3 transition hover:bg-white/[0.07] sm:grid-cols-[1fr_auto]"
                  onClick={() => {
                    pushRecentSearch(query || match.title);
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{match.title}</p>
                    <p className="mt-1 text-xs text-white/70">{new Date(match.date).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={match.popular ? "hot" : "cyan"}>{formatSportName(match.category)}</Badge>
                    <Badge variant="live">{match.sources.length} feeds</Badge>
                  </div>
                </Link>
              ))}
              {results.length === 0 ? (
                <div className="p-8 text-center text-sm text-white/72">No match signal found for that search.</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
