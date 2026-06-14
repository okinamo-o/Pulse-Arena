import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchDetailView } from "@/components/match/match-detail-view";
import { getMatchById, getTodayMatches } from "@/lib/streamed/client";
import { dedupeMatches, sortByHeat } from "@/lib/streamed/selectors";

export const revalidate = 30;

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchById(decodeURIComponent(id));
  return {
    title: match?.title ?? "Match Center",
    description: match
      ? `Watch source availability, live status, match radar, and momentum for ${match.title}.`
      : "Premium live sports match center."
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const match = await getMatchById(decodeURIComponent(id));

  if (!match) notFound();

  const today = await getTodayMatches();
  const related = sortByHeat(dedupeMatches(today.filter((item) => item.category === match.category && item.id !== match.id))).slice(0, 8);

  return <MatchDetailView match={match} related={related} />;
}
