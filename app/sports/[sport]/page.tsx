import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SportDetail } from "@/components/system/sport-detail";
import { getMatchesBySport, getPopularMatchesBySport, getSports } from "@/lib/streamed/client";
import { formatSportName } from "@/lib/streamed/selectors";

export const revalidate = 60;

interface SportPageProps {
  params: Promise<{ sport: string }>;
}

export async function generateMetadata({ params }: SportPageProps): Promise<Metadata> {
  const { sport } = await params;
  const title = formatSportName(decodeURIComponent(sport));
  return {
    title,
    description: `Live and upcoming ${title} streams, match details, and source availability.`
  };
}

export default async function SportPage({ params }: SportPageProps) {
  const { sport: rawSport } = await params;
  const sportId = decodeURIComponent(rawSport);
  const [sports, matches, popular] = await Promise.all([
    getSports(),
    getMatchesBySport(sportId),
    getPopularMatchesBySport(sportId)
  ]);
  const sport = sports.find((item) => item.id === sportId);

  if (!sport && matches.length === 0) notFound();

  return <SportDetail sport={sport} matches={matches} popular={popular} />;
}
