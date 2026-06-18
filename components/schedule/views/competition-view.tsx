import * as React from "react";
import { Trophy } from "lucide-react";
import { ScheduleCard } from "@/components/schedule/schedule-card";
import { formatSportName } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";

interface CompetitionGroup {
  category: string;
  matches: StreamedMatch[];
}

interface CompetitionViewProps {
  groups: CompetitionGroup[];
  now: number;
}

export function CompetitionView({ groups, now }: CompetitionViewProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-white/30">
          No matches found
        </p>
        <p className="mt-2 text-sm text-white/54">Adjust filters and search queries.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.category} className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Trophy className="h-4 w-4 text-signal-cyan" />
            <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">
              {formatSportName(group.category)}
            </h2>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.62rem] font-bold text-white/50">
              {group.matches.length} matches
            </span>
          </div>
          <div className="space-y-3">
            {group.matches.map((match) => (
              <ScheduleCard key={match.id} match={match} now={now} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
