"use client";

import { Suspense } from "react";
import { ScheduleView } from "@/components/schedule/schedule-view";

interface ScheduleShellProps {
  initialNow: number;
}

/**
 * Shell layout wrapper for ScheduleView.
 */
export function ScheduleShell({ initialNow }: ScheduleShellProps) {
  return (
    <Suspense fallback={
      <main className="container-page min-h-screen pt-28">
        <div className="h-[52vh] min-h-[420px] w-full rounded-2xl bg-white/[0.03] animate-pulse" />
      </main>
    }>
      <ScheduleView initialNow={initialNow} />
    </Suspense>
  );
}
