"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Maximize, Radio, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/match/match-card";
import type { StreamedMatch, StreamedStream } from "@/lib/streamed/types";
import { StreamTelemetrySidebar } from "@/components/stream/stream-telemetry-sidebar";

interface StreamViewProps {
  source: string;
  id: string;
  streams: StreamedStream[];
  match?: StreamedMatch;
  related: StreamedMatch[];
}

export function StreamView({ id, streams, match, related }: StreamViewProps) {
  const [active, setActive] = React.useState(streams[0]);
  const activeStream = active ?? streams[0];
  const router = useRouter();

  React.useEffect(() => {
    setActive(streams[0]);
  }, [streams]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (isTyping) return;

      const key = event.key.toLowerCase();

      if (key === "f") {
        event.preventDefault();
        const iframe = document.querySelector("iframe");
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else {
          iframe?.requestFullscreen?.();
        }
      }

      if (key === "escape" && document.fullscreenElement) {
        document.exitFullscreen?.();
      }

      if (key === "/") {
        event.preventDefault();
        router.push("/search");
      }

      const num = parseInt(event.key, 10);
      if (num >= 1 && num <= 9 && streams[num - 1]) {
        event.preventDefault();
        setActive(streams[num - 1]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [streams, router]);

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <div className={match ? "grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[300px_1fr_360px]" : "grid gap-6 xl:grid-cols-[1fr_360px]"}>
        {match ? (
          <aside className="hidden xl:block sticky top-32 h-fit">
            <StreamTelemetrySidebar match={match} />
          </aside>
        ) : null}

        <section className="flex flex-col min-w-0">
          <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-panel">
            <div className="flex items-center justify-between border-b border-white/10 bg-graphite-900/90 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Badge variant="live">
                  <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                  Live source
                </Badge>
                <p className="truncate text-sm font-bold text-white/72">{match?.title ?? id}</p>
              </div>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Open fullscreen"
                onClick={() => document.querySelector("iframe")?.requestFullscreen?.()}
              >
                <Maximize className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="aspect-video bg-graphite-950">
              {activeStream ? (
                <iframe
                  key={activeStream.embedUrl}
                  src={activeStream.embedUrl}
                  title={`${match?.title ?? "Live sports"} stream ${activeStream.streamNo}`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Tv className="h-10 w-10 text-signal-lime" aria-hidden="true" />
                  <p className="font-bold text-white">No stream returned by this source yet.</p>
                </div>
              )}
            </div>
          </div>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase text-white">Source switcher</h2>
              <Badge variant="cyan">{streams.length} streams</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {streams.map((stream) => {
                const selected = activeStream?.streamNo === stream.streamNo;
                return (
                  <button
                    key={`${stream.source}-${stream.streamNo}`}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-signal-lime bg-signal-lime/12 shadow-glow"
                        : "border-white/10 bg-white/[0.055] hover:border-signal-lime/35"
                    }`}
                    onClick={() => setActive(stream)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white/44">
                          Stream {stream.streamNo}
                        </p>
                        <p className="mt-2 text-base font-black text-white">{stream.language}</p>
                      </div>
                      <Badge variant={stream.hd ? "live" : "muted"}>{stream.hd ? "HD" : "SD"}</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] text-white/46">
                      <span>{stream.source}</span>
                      <span>{stream.viewers ? `${stream.viewers.toLocaleString()} viewers` : "Live"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </section>

        <aside className="space-y-4">


          {match ? (
            <Button asChild className="w-full">
              <Link href={`/match/${match.id}`}>Match center</Link>
            </Button>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-black uppercase text-white">Related live matches</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.slice(0, 6).map((item) => (
              <MatchCard key={item.id} match={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

