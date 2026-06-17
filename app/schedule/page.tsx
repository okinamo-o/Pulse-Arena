import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllMatches, getSports } from "@/lib/streamed/client";
import { ScheduleShell } from "@/components/schedule/schedule-shell";
import Loading from "@/app/loading";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Browse upcoming live sports events, matches, and broadcasts across all sports."
};

export const revalidate = 60;

// Resolve the promises inside a suspended server sub-component
async function ScheduleViewFetcher({ initialNow }: { initialNow: number }) {
  const [sports, matches] = await Promise.all([getSports(), getAllMatches()]);
  return <ScheduleShell initialSports={sports} initialMatches={matches} initialNow={initialNow} />;
}

export default function SchedulePage() {
  const initialNow = Date.now();

  return (
    <Suspense fallback={<Loading />}>
      <ScheduleViewFetcher initialNow={initialNow} />
    </Suspense>
  );
}
