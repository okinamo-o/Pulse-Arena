import * as React from "react";
import type { SportMatch } from "@/lib/ppv/types";

export function useScheduleFilters(matchesForSelectedDate: SportMatch[], selectedSports: string[]) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredMatches = React.useMemo(() => {
    return matchesForSelectedDate.filter((match) => {
      // Sport Category filter
      if (selectedSports.length > 0 && !selectedSports.includes(match.category)) {
        return false;
      }
      
      // Search term filter
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery.toLowerCase().trim();
        const haystack = `${match.title} ${match.category} ${match.teams?.home?.name ?? ""} ${match.teams?.away?.name ?? ""}`.toLowerCase();
        return cleanQuery.split(/\s+/).every((term) => haystack.includes(term));
      }
      
      return true;
    });
  }, [matchesForSelectedDate, selectedSports, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredMatches
  };
}
