import type { Metadata } from "next";
import { Suspense } from "react";
import { ScheduleView } from "@/components/schedule/schedule-view";
import Loading from "@/app/loading";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Browse upcoming live sports events, matches, and broadcasts across all sports."
};

export default function SchedulePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ScheduleView />
    </Suspense>
  );
}
