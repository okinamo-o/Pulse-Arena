import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { StreamedMatch, StreamedSport } from "@/lib/streamed/types";

export function SportsDirectory({ sports, matches }: { sports: StreamedSport[]; matches: StreamedMatch[] }) {
  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-panel backdrop-blur-2xl">
        <Badge variant="cyan">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          Sports index
        </Badge>
        <h1 className="mt-5 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          Every sport, ranked by live signal
        </h1>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {sports.map((sport, index) => {
          const sportMatches = matches.filter((match) => match.category === sport.id);
          const liveCount = sportMatches.filter((match) => match.date <= Date.now()).length;
          return (
            <Link key={sport.id} href={`/sports/${sport.id}`} className="group">
              <GlassPanel className="clip-sport min-h-52 p-5 transition group-hover:-translate-y-1 group-hover:border-signal-lime/40">
                <div className="flex items-center justify-between">
                  <Badge variant={index % 2 === 0 ? "live" : "hot"}>{sportMatches.length} events</Badge>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:text-signal-lime" aria-hidden="true" />
                </div>
                <h2 className="mt-10 text-2xl font-black uppercase text-white">{sport.name}</h2>
                <p className="mt-2 text-sm text-white/52">{liveCount} signals are in or near the live window.</p>
              </GlassPanel>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
