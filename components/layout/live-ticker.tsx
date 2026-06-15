"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { useLiveMatches } from "@/hooks/use-streamed";
import { getCountdownLabel } from "@/lib/streamed/selectors";

export function LiveTicker() {
  const { data = [] } = useLiveMatches();
  const items = data.slice(0, 14);

  const tickerRef = useRef<HTMLDivElement | null>(null);

  // JS-controlled marquee for consistent scrolling behaviour across
  // all `prefers-reduced-motion` settings.
  useEffect(() => {
    const el = tickerRef.current;
    if (!el || items.length === 0) return;

    let rafId: number | null = null;
    const start = performance.now();
    const duration = 30000; // one full loop in ms

    const measure = () => Math.max(1, el.scrollWidth / 2);
    let loopWidth = measure();

    const onResize = () => {
      loopWidth = measure();
    };
    window.addEventListener("resize", onResize);

    // Disable any CSS animation so only JS controls motion
    const prevAnimation = el.style.animation;
    el.style.animation = "none";

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = (elapsed % duration) / duration;
      const offset = progress * loopWidth;
      el.style.transform = `translateX(${-offset}px)`;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      el.style.transform = "";
      el.style.animation = prevAnimation ?? "";
    };
  }, [items]);

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
      <div ref={tickerRef} className="flex h-9 w-max items-center gap-6 px-4 will-change-transform">
        {marquee.map((match, index) => (
          <Link
            key={`${match.id}-${index}`}
            href={`/match/${match.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-white/72 transition hover:text-white"
          >
            <span className="relative h-2 w-2 rounded-full bg-signal-lime">
              <span className="absolute inset-0 animate-pulse-live rounded-full bg-signal-lime" />
            </span>
            <span className="text-signal-lime">{getCountdownLabel(match.date)}</span>
            <span>{match.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
