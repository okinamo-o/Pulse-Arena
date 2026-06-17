import type { Metadata } from "next";
import { getAllMatches, getSports } from "@/lib/streamed/client";
import { ScheduleShell } from "@/components/schedule/schedule-shell";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Browse upcoming live sports events, matches, and broadcasts across all sports."
};

export const revalidate = 60;

export default async function SchedulePage() {
  // Fetch data on the server so the page renders instantly with real content
  const [sports, matches] = await Promise.all([getSports(), getAllMatches()]);
  const initialNow = Date.now();

  return <ScheduleShell initialSports={sports} initialMatches={matches} initialNow={initialNow} />;
}
