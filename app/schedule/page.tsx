import type { Metadata } from "next";
import { ScheduleShell } from "@/components/schedule/schedule-shell";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Browse upcoming live sports events, matches, and broadcasts across all sports."
};

export default function SchedulePage() {
  const initialNow = Date.now();
  return <ScheduleShell initialNow={initialNow} />;
}
