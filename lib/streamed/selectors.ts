import type { MatchInsight, MatchStatus, NormalizedMatch, StreamedMatch, StreamedStream } from "@/lib/streamed/types";

const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000;
const RECENT_WINDOW_MS = 90 * 60 * 1000;

export function getMatchStatus(match: StreamedMatch, now = Date.now()): MatchStatus {
  const startsIn = match.date - now;
  if (startsIn <= 0 && Math.abs(startsIn) <= LIVE_WINDOW_MS) return "live";
  if (startsIn > 0) return "upcoming";
  if (Math.abs(startsIn) <= LIVE_WINDOW_MS + RECENT_WINDOW_MS) return "recent";
  return "ended";
}

export function getHeatScore(match: StreamedMatch, now = Date.now()) {
  const status = getMatchStatus(match, now);
  const sourceScore = Math.min(match.sources.length * 12, 34);
  const popularScore = match.popular ? 24 : 8;
  const timingScore =
    status === "live" ? 34 : status === "upcoming" ? Math.max(4, 28 - Math.floor((match.date - now) / 1800000)) : 6;
  return Math.max(1, Math.min(100, sourceScore + popularScore + timingScore));
}

export function normalizeMatch(match: StreamedMatch, now = Date.now()): NormalizedMatch {
  return {
    ...match,
    heatScore: getHeatScore(match, now),
    status: getMatchStatus(match, now),
    startsInMs: match.date - now
  };
}

export function normalizeMatches(matches: StreamedMatch[], now = Date.now()) {
  return matches.map((match) => normalizeMatch(match, now));
}

export function sortByHeat(matches: StreamedMatch[], now = Date.now()) {
  return [...matches].sort((a, b) => getHeatScore(b, now) - getHeatScore(a, now));
}

export function formatSportName(sport: string) {
  return sport
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMatchDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(timestamp);
}

export function getCountdownLabel(timestamp: number, now = Date.now()) {
  const diff = timestamp - now;
  if (diff <= 0 && Math.abs(diff) <= LIVE_WINDOW_MS) return "Live now";
  if (diff <= 0) return "Recently aired";
  const totalMinutes = Math.ceil(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getTeamInitials(name?: string) {
  if (!name) return "PA";
  const words = name.replace(/[^\w\s-]/g, "").split(/\s+|-/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function getMatchParticipants(match: StreamedMatch) {
  return {
    home: match.teams?.home?.name ?? match.title.split(/\s+vs\.?\s+|\s+-\s+/i)[0] ?? "Home",
    away: match.teams?.away?.name ?? match.title.split(/\s+vs\.?\s+|\s+-\s+/i)[1] ?? "Away"
  };
}

export function findMatchBySource(matches: StreamedMatch[], source: string, id: string) {
  return matches.find((match) => match.sources.some((candidate) => candidate.source === source && candidate.id === id));
}

export function buildMatchInsights(match: StreamedMatch, streams: StreamedStream[] = []): MatchInsight[] {
  const status = getMatchStatus(match);
  const heat = getHeatScore(match);
  const hdStreams = streams.filter((stream) => stream.hd).length;
  const totalViewers = streams.reduce((sum, stream) => sum + (stream.viewers ?? 0), 0);

  return [
    {
      label: "Pulse",
      value: heat > 78 ? "Peak demand" : heat > 54 ? "Building fast" : "Available signal",
      tone: heat > 78 ? "orange" : "lime"
    },
    {
      label: "Coverage",
      value: `${match.sources.length} source${match.sources.length === 1 ? "" : "s"} detected`,
      tone: "cyan"
    },
    {
      label: "Quality",
      value: streams.length > 0 ? `${hdStreams}/${streams.length} HD feeds` : "Streams reveal on open",
      tone: streams.length > 0 ? "lime" : "muted"
    },
    {
      label: "Audience",
      value: totalViewers > 0 ? `${totalViewers.toLocaleString()} viewers` : status === "live" ? "Live activity" : "Pre-match watchlist",
      tone: totalViewers > 10000 ? "orange" : "muted"
    }
  ];
}

export function dedupeMatches(matches: StreamedMatch[]) {
  const seen = new Set<string>();
  return matches.filter((match) => {
    if (seen.has(match.id)) return false;
    seen.add(match.id);
    return true;
  });
}
