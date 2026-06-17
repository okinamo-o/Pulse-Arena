"use client";

import * as React from "react";
import { ScheduleView } from "@/components/schedule/schedule-view";

interface ScheduleShellProps {
  initialNow: number;
}

/**
 * Shell layout wrapper for ScheduleView.
 */
export function ScheduleShell({ initialNow }: ScheduleShellProps) {
  return <ScheduleView initialNow={initialNow} />;
}
