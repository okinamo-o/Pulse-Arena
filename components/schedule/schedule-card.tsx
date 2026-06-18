"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CalendarRange, ExternalLink, Radio, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamBadge } from "@/components/match/team-badge";
import { FavoriteButton } from "@/components/match/favorite-button";
import { ReminderButton } from "@/components/match/reminder-button";
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
  generateICSDownloadUrl
} from "@/lib/streamed/schedule";
import { formatSportName, getMatchParticipants, getMatchStatus } from "@/lib/streamed/selectors";
import type { StreamedMatch } from "@/lib/streamed/types";
import { cn } from "@/lib/utils/cn";

interface ScheduleCardProps {
  match: StreamedMatch;
  className?: string;
  /** Shared timestamp from parent to avoid per-card timers */
  now?: number;
}

export function ScheduleCard({ match, className, now: externalNow }: ScheduleCardProps) {
  const [showCalendarMenu, setShowCalendarMenu] = React.useState(false);
  const now = externalNow ?? Date.now();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close calendar menu on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCalendarMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const participants = getMatchParticipants(match);
  const status = getMatchStatus(match, now);
  const firstSource = match.sources[0];

  const localTime = React.useMemo(() => {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: mounted ? undefined : "UTC"
    }).format(match.date);
  }, [match.date, mounted]);

  const localDate = React.useMemo(() => {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      timeZone: mounted ? undefined : "UTC"
    }).format(match.date);
  }, [match.date, mounted]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-graphite-900/80 p-4 shadow-panel backdrop-blur-xl transition duration-300 hover:border-signal-lime/30 hover:bg-white/[0.04]",
        status === "live" && "border-signal-lime/20 bg-signal-lime/[0.02]",
        className
      )}
    >
      {/* Decorative gradient for Live events */}
      {status === "live" && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_2%_2%,rgb(183_255_42_/_0.06),transparent_24%)]" />
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Time and Metadata */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span suppressHydrationWarning className="font-mono text-xl font-black text-white">{localTime}</span>
            <span suppressHydrationWarning className="text-[0.68rem] font-bold uppercase tracking-wider text-white/45">
              {localDate}
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col gap-1">
            <Badge variant={status === "live" ? "live" : status === "upcoming" ? "cyan" : "muted"}>
              {status === "live" && <Radio className="h-3 w-3 animate-pulse-live" />}
              {status === "live" ? "LIVE NOW" : status === "upcoming" ? "UPCOMING" : "FINISHED"}
            </Badge>
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-signal-cyan/90">
              {formatSportName(match.category)}
            </span>
          </div>
        </div>

        {/* Center: Matchup Details */}
        <div className="flex flex-1 items-center justify-between gap-4 border-y border-white/5 py-3 md:border-y-0 md:py-0">
          <Link href={`/match/${match.id}`} className="flex flex-1 items-center justify-center gap-3 md:justify-start">
            <div className="flex items-center gap-2 max-w-[40%] text-right">
              <span className="hidden truncate text-sm font-bold text-white/90 sm:inline-block">
                {participants.home}
              </span>
              <TeamBadge name={participants.home} badge={match.teams?.home?.badge} size="sm" />
            </div>

            <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[0.62rem] font-black text-white/60">
              VS
            </span>

            <div className="flex items-center gap-2 max-w-[40%] text-left">
              <TeamBadge name={participants.away} badge={match.teams?.away?.badge} size="sm" />
              <span className="hidden truncate text-sm font-bold text-white/90 sm:inline-block">
                {participants.away}
              </span>
            </div>
          </Link>
          
          <div className="hidden flex-col items-center justify-center text-center lg:flex">
            <span className="truncate max-w-[140px] text-xs font-semibold text-white/40">
              {match.title}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action Bar */}
        <div className="flex items-center justify-between gap-3 md:justify-end shrink-0">
          <div className="flex items-center gap-1.5">
            <FavoriteButton match={match} compact />
            {status === "upcoming" && <ReminderButton match={match} compact />}
            
            {/* Calendar Export Menu */}
            {status === "upcoming" && (
              <div className="relative" ref={menuRef}>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="Export schedule to calendar"
                  onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                  className={cn(showCalendarMenu && "bg-white/10 text-white")}
                >
                  <CalendarRange className="h-4 w-4" />
                </Button>
                
                <AnimatePresence>
                  {showCalendarMenu && (
                    <motion.div
                      key="calendar-menu"
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 z-50 w-44 rounded-lg border border-white/10 bg-graphite-950 p-1.5 shadow-2xl backdrop-blur-xl"
                    >
                      <p className="px-2 py-1.5 text-[0.68rem] font-black uppercase tracking-wider text-white/38">
                        Add to Calendar
                      </p>
                      <div className="h-px bg-white/5 my-1" />
                      
                      <a
                        href={generateGoogleCalendarUrl(match)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-white/78 transition hover:bg-white/[0.08] hover:text-white"
                        onClick={() => setShowCalendarMenu(false)}
                      >
                        <ExternalLink className="h-3 w-3 text-signal-cyan" />
                        Google Calendar
                      </a>
                      
                      <a
                        href={generateOutlookUrl(match)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-white/78 transition hover:bg-white/[0.08] hover:text-white"
                        onClick={() => setShowCalendarMenu(false)}
                      >
                        <ExternalLink className="h-3 w-3 text-signal-orange" />
                        Outlook Web
                      </a>
                      
                      <a
                        href={generateICSDownloadUrl(match)}
                        download={`pulse-arena-${match.id}.ics`}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-white/78 transition hover:bg-white/[0.08] hover:text-white"
                        onClick={() => setShowCalendarMenu(false)}
                      >
                        <Download className="h-3 w-3 text-signal-lime" />
                        iCal / ICS File
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {status !== "upcoming" && firstSource ? (
              <Button asChild variant="default" size="sm" className="h-9">
                <Link href={`/watch/${firstSource.source}/${encodeURIComponent(firstSource.id)}`}>
                  Watch
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="sm" className="h-9">
                <Link href={`/match/${match.id}`}>
                  Details
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
