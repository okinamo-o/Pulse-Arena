import type { Metadata } from "next";
import { SportsDirectory } from "@/components/system/sports-directory";
import { getSports, getTodayMatches } from "@/lib/streamed/client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sports",
  description: "Browse every sport available from the Streamed public API."
};

export default async function SportsPage() {
  const [sports, matches] = await Promise.all([getSports(), getTodayMatches()]);
  return <SportsDirectory sports={sports} matches={matches} />;
}
