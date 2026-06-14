import { HomeHub } from "@/components/home/home-hub";
import { getLiveMatches, getSports, getTodayMatches } from "@/lib/streamed/client";

export const revalidate = 30;

export default async function HomePage() {
  const [sports, liveMatches, todayMatches] = await Promise.all([getSports(), getLiveMatches(), getTodayMatches()]);

  return <HomeHub sports={sports} liveMatches={liveMatches} todayMatches={todayMatches} />;
}
