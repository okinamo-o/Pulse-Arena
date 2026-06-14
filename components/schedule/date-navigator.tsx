"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysRange, toLocalDateString, getScheduleDensity } from "@/lib/streamed/schedule";
import type { StreamedMatch } from "@/lib/streamed/types";
import { cn } from "@/lib/utils/cn";

interface DateNavigatorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateString: string) => void;
  matches: StreamedMatch[];
}

export function DateNavigator({ selectedDate, onSelectDate, matches }: DateNavigatorProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const days = React.useMemo(() => getDaysRange(10), []);

  // Compute counts for each day in our range
  const dayCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    matches.forEach((match) => {
      const matchDateStr = toLocalDateString(match.date);
      counts[matchDateStr] = (counts[matchDateStr] || 0) + 1;
    });
    return counts;
  }, [matches]);

  // Handle custom date picker
  const handleCustomDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val) {
      onSelectDate(val);
    }
  };

  // Scroll controls
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const isCustomDateSelected = React.useMemo(() => {
    return !days.some((day) => day.dateString === selectedDate);
  }, [days, selectedDate]);

  const customDisplayDate = React.useMemo(() => {
    if (!isCustomDateSelected) return "";
    try {
      const parts = selectedDate.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d);
    } catch {
      return selectedDate;
    }
  }, [selectedDate, isCustomDateSelected]);

  return (
    <div className="sticky top-16 z-30 border-b border-white/10 bg-graphite-950/80 backdrop-blur-md">
      <div className="container-page flex items-center justify-between py-3 gap-2">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white md:flex shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Date Container (Swipeable) */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex flex-1 snap-x gap-2 overflow-x-auto px-1 scroll-smooth"
        >
          {days.map((day) => {
            const isActive = day.dateString === selectedDate;
            const count = dayCounts[day.dateString] || 0;
            const density = getScheduleDensity(count);
            
            // Density color indicator dots
            const dotColor =
              density.tone === "lime"
                ? "bg-signal-lime shadow-[0_0_8px_#b7ff2a]"
                : density.tone === "orange"
                ? "bg-signal-orange"
                : "bg-signal-cyan";

            return (
              <button
                key={day.dateString}
                onClick={() => onSelectDate(day.dateString)}
                className={cn(
                  "relative flex min-w-[84px] snap-start flex-col items-center justify-center rounded-xl border p-2 transition-all duration-300",
                  isActive
                    ? "border-signal-lime/50 bg-signal-lime/10 shadow-[0_0_20px_rgba(183,255,42,0.15)] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <span className="text-[0.62rem] font-black uppercase tracking-wider">
                  {day.dayName}
                </span>
                <span className="mt-1 font-mono text-sm font-black">
                  {day.displayDate.split(" ")[1]}
                </span>
                
                {/* Count and indicator dot */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
                  <span className="text-[0.65rem] font-bold opacity-80">{count} matches</span>
                </div>
                
                {isActive && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-t-full bg-signal-lime" />
                )}
              </button>
            );
          })}

          {/* Custom Date Selector Chip */}
          <div
            className={cn(
              "relative flex min-w-[100px] snap-start items-center justify-center rounded-xl border px-3 transition-all duration-300",
              isCustomDateSelected
                ? "border-signal-lime/50 bg-signal-lime/10 shadow-[0_0_20px_rgba(183,255,42,0.15)] text-white"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-1">
              <Calendar className={cn("h-4 w-4", isCustomDateSelected ? "text-signal-lime" : "text-white/60")} />
              <span className="mt-1 text-[0.6rem] font-black uppercase tracking-wider leading-none">
                {isCustomDateSelected ? customDisplayDate : "Pick Date"}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={handleCustomDateChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white md:flex shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
