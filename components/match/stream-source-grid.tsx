"use client";

import Link from "next/link";
import { ArrowUpRight, Gauge, Languages, MonitorPlay, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStreams } from "@/hooks/use-streamed";
import type { StreamedMatch } from "@/lib/streamed/types";

export function StreamSourceGrid({ match }: { match: StreamedMatch }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {match.sources.map((source) => (
        <SourceCard key={`${source.source}-${source.id}`} source={source.source} id={source.id} />
      ))}
    </div>
  );
}

function SourceCard({ source, id }: { source: string; id: string }) {
  const { data = [], isLoading } = useStreams(source, id, true);
  const hd = data.filter((stream) => stream.hd).length;
  const viewers = data.reduce((sum, stream) => sum + (stream.viewers ?? 0), 0);

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.055] p-4 shadow-inner-line transition hover:border-signal-lime/35 hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="cyan">{source}</Badge>
          <h3 className="mt-3 break-all font-mono text-sm font-bold text-white/78">{id}</h3>
        </div>
        <MonitorPlay className="h-5 w-5 text-signal-lime" aria-hidden="true" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Metric icon={Gauge} value={isLoading ? "..." : `${hd}/${Math.max(data.length, 1)}`} label="HD" />
        <Metric icon={Languages} value={isLoading ? "..." : `${new Set(data.map((item) => item.language)).size || 1}`} label="Lang" />
        <Metric icon={Users} value={viewers > 0 ? compactNumber(viewers) : "Live"} label="Viewers" />
      </div>
      <Button asChild className="mt-4 w-full">
        <Link href={`/watch/${source}/${encodeURIComponent(id)}`}>
          Open source
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof Gauge; value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
        <Icon className="h-3.5 w-3.5 text-signal-lime" aria-hidden="true" />
        {value}
      </div>
      <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/38">{label}</p>
    </div>
  );
}

function compactNumber(value: number) {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
