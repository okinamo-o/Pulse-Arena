"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

interface DegradedModeBannerProps {
  lastUpdated?: number;
}

export function DegradedModeBanner({ lastUpdated }: DegradedModeBannerProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const timeString = React.useMemo(() => {
    if (!mounted || !lastUpdated) return "Unknown";
    return new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [mounted, lastUpdated]);

  return (
    <div className="bg-signal-orange/20 border-b border-signal-orange/30 text-signal-orange px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4" />
      <span>
        LIVE FEED DISCONNECTED - Showing offline cached data (Last updated: {timeString})
      </span>
    </div>
  );
}
