"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { useLiveMatches } from "@/hooks/use-streamed";
import { getCountdownLabel } from "@/lib/streamed/selectors";
import { usePreferencesStore } from "@/store/preferences-store";
import { usePathname } from "next/navigation";

export function LiveTicker() {
  const pathname = usePathname();
  const reducedMotion = usePreferencesStore((state) => state.reducedMotion);
  const enabled = !["/settings", "/favorites", "/search"].includes(pathname);
  
  const { data = [] } = useLiveMatches(enabled);
  const items = data.slice(0, 14);

  if (!enabled) return null;

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

  return (
    <div className="fixed left-0 right-0 top-16 z-30 flex overflow-hidden border-b border-white/10 bg-graphite-900/72 backdrop-blur-xl">
      <div 
        className={`flex h-9 w-max will-change-transform ${reducedMotion ? "" : "animate-ticker"}`}
        style={{ animationDuration: "40s" }}
      >
        <div className="flex w-max items-center gap-6 px-3">
          {items.map((match, index) => (
            <Link
              key={`ticker-a-${match.id}-${index}`}
              href={`/match/${match.id}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-white/72 transition hover:text-white"
            >
              <span className="relative h-2 w-2 rounded-full bg-signal-lime">
                <span className="absolute inset-0 animate-pulse-live rounded-full bg-signal-lime" />
              </span>
              <span className="text-signal-lime">{getCountdownLabel(match.date, undefined, match.category)}</span>
              <span>{match.title}</span>
            </Link>
          ))}
        </div>
        <div className="flex w-max items-center gap-6 px-3" aria-hidden="true">
          {items.map((match, index) => (
            <Link
              key={`ticker-b-${match.id}-${index}`}
              href={`/match/${match.id}`}
              tabIndex={-1}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-white/72 transition hover:text-white"
            >
              <span className="relative h-2 w-2 rounded-full bg-signal-lime">
                <span className="absolute inset-0 animate-pulse-live rounded-full bg-signal-lime" />
              </span>
              <span className="text-signal-lime">{getCountdownLabel(match.date, undefined, match.category)}</span>
              <span>{match.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
