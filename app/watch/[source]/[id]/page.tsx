import type { Metadata } from "next";
import { StreamView } from "@/components/stream/stream-view";
import { sortByHeat } from "@/lib/streamed/selectors";
import { getMatchById, getStreams, getTodayMatches } from "@/lib/streamed/client";

export const revalidate = 20;

interface WatchPageProps {
  params: Promise<{ source: string; id: string }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { source, id } = await params;
  return {
    title: `Watch ${decodeURIComponent(source)}`,
    description: `Live stream source ${decodeURIComponent(source)} for ${decodeURIComponent(id)}.`
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { source: rawSource, id: rawId } = await params;
  const source = decodeURIComponent(rawSource);
  const id = decodeURIComponent(rawId);
  const [streams, matches, match] = await Promise.all([getStreams(source, id), getTodayMatches(), getMatchById(id)]);
  const related = sortByHeat(matches.filter((item) => item.id !== match?.id && (!match || item.category === match.category))).slice(0, 6);

  return <StreamView source={source} id={id} streams={streams} match={match} related={related} />;
}
