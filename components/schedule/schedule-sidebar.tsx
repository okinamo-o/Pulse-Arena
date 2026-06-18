import * as React from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { formatSportName, getMatchStatus } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";

interface ScheduleSidebarProps {
  matches: StreamedMatch[];
  now: number;
  mounted: boolean;
  timeZoneName: string;
}

export function ScheduleSidebar({ matches, now, mounted, timeZoneName }: ScheduleSidebarProps) {
  const popularUpcoming = React.useMemo(() => {
    return matches
      .filter((m) => getMatchStatus(m, now) === "upcoming" && m.popular)
      .sort((a, b) => a.date - b.date)
      .slice(0, 5);
  }, [matches, now]);

  return (
    <div className="space-y-6">
      <GlassPanel className="p-4" glow="orange">
        <div className="flex items-center gap-2 mb-4 text-signal-orange">
          <Flame className="h-5 w-5" />
          <h3 className="font-display text-xs font-black uppercase tracking-wider">
            Popular Upcoming Matches
          </h3>
        </div>

        <div className="space-y-3">
          {popularUpcoming.length === 0 ? (
            <p className="text-xs text-white/38 py-4 text-center">
              No hot matches upcoming.
            </p>
          ) : (
            popularUpcoming.map((match) => {
              const localTime = new Intl.DateTimeFormat("en", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: mounted ? undefined : "UTC"
              }).format(match.date);
              const localDate = new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
                timeZone: mounted ? undefined : "UTC"
              }).format(match.date);

              return (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="group block rounded-lg border border-white/5 bg-white/[0.02] p-2.5 transition hover:border-signal-orange/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.62rem] font-black uppercase tracking-wider text-signal-cyan">
                      {formatSportName(match.category)}
                    </span>
                    <span suppressHydrationWarning className="font-mono text-[0.68rem] font-bold text-white/40">
                      {localDate} {localTime}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-xs font-bold text-white/90 group-hover:text-white">
                    {match.title}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <h4 className="font-display text-xs font-black uppercase tracking-wider text-white/70 mb-2">
          Timezone Info
        </h4>
        <p className="text-xs text-white/50 leading-relaxed">
          Matches are automatically formatted using your browser timezone settings ({timeZoneName}). Set reminders on upcoming signals to receive notifications.
        </p>
      </GlassPanel>
    </div>
  );
}
