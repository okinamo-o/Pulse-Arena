import * as React from "react";
import { Search, LayoutList, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface ScheduleFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode: "timeline" | "competition";
  setViewMode: (val: "timeline" | "competition") => void;
}

export function ScheduleFilters({ searchQuery, setSearchQuery, viewMode, setViewMode }: ScheduleFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Fuzzy search this schedule..."
          className="pl-9 bg-graphite-900 border-white/10"
        />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1 shrink-0 w-full sm:w-auto">
        <button
          onClick={() => setViewMode("timeline")}
          className={cn(
            "flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition",
            viewMode === "timeline" ? "bg-white/[0.08] text-white shadow-inner-line" : "text-white/50 hover:text-white"
          )}
        >
          <LayoutList className="h-3.5 w-3.5" />
          Timeline
        </button>
        <button
          onClick={() => setViewMode("competition")}
          className={cn(
            "flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition",
            viewMode === "competition" ? "bg-white/[0.08] text-white shadow-inner-line" : "text-white/50 hover:text-white"
          )}
        >
          <Trophy className="h-3.5 w-3.5" />
          Competitions
        </button>
      </div>
    </div>
  );
}
