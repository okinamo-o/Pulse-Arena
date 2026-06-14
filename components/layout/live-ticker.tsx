"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { useLiveMatches } from "@/hooks/use-streamed";
import { getCountdownLabel } from "@/lib/streamed/selectors";

export function LiveTicker() {
  const { data = [] } = useLiveMatches();
  const items = data.slice(0, 14);

  useEffect(() => {
    console.debug("LiveTicker: live matches", {
      count: data.length,
      sample: data.slice(0, 5).map((m) => ({ id: m.id, title: m.title }))
    });
  }, [data]);

  if (items.length === 0) {
    return (
      <div className="fixed left-0 right-0 top-16 z-30 border-b border-white/10 bg-graphite-900/72 backdrop-blur-xl">
        <div className="container-page flex h-9 items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
          <Radio className="h-3.5 w-3.5 text-signal-lime" aria-hidden="true" />
          Scanning live sports
        </div>
      </div>
    );
  }

  const marquee = [...items, ...items];

  return (
    <div className="fixed left-0 right-0 top-16 z-30 overflow-hidden border-b border-white/10 bg-graphite-900/72 backdrop-blur-xl">
      <div className="flex h-9 w-max motion-safe:animate-ticker items-center gap-6 px-4 will-change-transform">
        {marquee.map((match, index) => (
          <Link
            key={`${match.id}-${index}`}
            href={`/match/${match.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-white/72 transition hover:text-white"
          >
            <span className="relative h-2 w-2 rounded-full bg-signal-lime">
              <span className="absolute inset-0 motion-safe:animate-pulse-live rounded-full bg-signal-lime" />
            </span>
            <span className="text-signal-lime">{getCountdownLabel(match.date)}</span>
            <span>{match.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
