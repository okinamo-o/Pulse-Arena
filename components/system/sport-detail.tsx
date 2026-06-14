import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/match/match-card";
import type { StreamedMatch, StreamedSport } from "@/lib/streamed/types";
import { formatSportName, sortByHeat } from "@/lib/streamed/selectors";

export function SportDetail({
  sport,
  matches,
  popular
}: {
  sport?: StreamedSport;
  matches: StreamedMatch[];
  popular: StreamedMatch[];
}) {
  const title = sport?.name ?? formatSportName(matches[0]?.category ?? "sport");
  const sorted = sortByHeat(matches);

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <Button asChild variant="secondary" className="mb-5">
        <Link href="/sports">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All sports
        </Link>
      </Button>
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-panel backdrop-blur-2xl">
        <Badge variant="live">{matches.length} events</Badge>
        <h1 className="mt-5 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          {title}
        </h1>
      </section>
      {popular.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-black uppercase text-white">Popular in {title}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {popular.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-black uppercase text-white">All {title} matches</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </main>
  );
}
