"use client";

import * as React from "react";
import { Clock, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCountdownLabel, getMatchStatus } from "@/lib/streamed/selectors";

export function CountdownChip({ date }: { date: number }) {
  const [mounted, setMounted] = React.useState(false);
  const [now, setNow] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <Badge variant="cyan">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        Scheduled
      </Badge>
    );
  }

  const status = getMatchStatus({ id: "", title: "", category: "", date, popular: false, sources: [] }, now);
  const live = status === "live";

  return (
    <Badge variant={live ? "live" : "cyan"}>
      {live ? <Radio className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
      {getCountdownLabel(date, now)}
    </Badge>
  );
}
