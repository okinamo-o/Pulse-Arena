import * as React from "react";
import type { SportMatch } from "@/lib/ppv/types";
import { groupMatchesByHour } from "@/lib/ppv/schedule";

export function useScheduleGrouping(filteredMatches: SportMatch[], mounted: boolean) {
  const hourGroups = React.useMemo(() => {
    return groupMatchesByHour(filteredMatches, !mounted);
  }, [filteredMatches, mounted]);

  const competitionGroups = React.useMemo(() => {
    const map: Record<string, SportMatch[]> = {};
    filteredMatches.forEach((m) => {
      const cat = m.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(m);
    });
    return Object.keys(map).map((catId) => ({
      category: catId,
      matches: map[catId]
    }));
  }, [filteredMatches]);

  return {
    hourGroups,
    competitionGroups
  };
}
