"use client";

import * as React from "react";
import { Clock, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCountdownLabel, getMatchStatus } from "@/lib/streamed/selectors";
import { useNow } from "@/hooks/use-now";

export function CountdownChip({ date, category = "" }: { date: number, category?: string }) {
  const now = useNow();

  if (now === 0) {
    return (
      <Badge variant="cyan">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        Scheduled
      </Badge>
    );
  }

  const status = getMatchStatus({ id: "", title: "", category, date, popular: false, sources: [] }, now);
  const live = status === "live";

  return (
    <Badge variant={live ? "live" : "cyan"}>
      {live ? <Radio className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
      {getCountdownLabel(date, now, category)}
    </Badge>
  );
}
