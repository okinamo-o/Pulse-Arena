import type { MatchInsight, MatchStatus, NormalizedMatch, SportMatch, SportStream } from "@/lib/ppv/types";

const DEFAULT_LIVE_WINDOW_MS = 135 * 60 * 1000;
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getLiveWindowMs(category?: string) {
  if (!category) return DEFAULT_LIVE_WINDOW_MS;
  const c = category.toLowerCase();
  if (c.includes("cricket") || c.includes("golf") || c.includes("motor")) return 300 * 60 * 1000; // 5 hours
  if (c.includes("baseball") || c.includes("tennis") || c.includes("fight") || c.includes("wrestling")) {
    return 240 * 60 * 1000; // 4 hours
  }
  if (c.includes("american-football")) return 210 * 60 * 1000; // 3.5 hours
  return DEFAULT_LIVE_WINDOW_MS;
}

export function getMatchStatus(match: SportMatch, now = Date.now()): MatchStatus {
  if (match.alwaysLive) return "live";

  const startsIn = match.date - now;
  if (startsIn > 0) return "upcoming";

  if (match.endsAt && match.endsAt > match.date) {
    if (now <= match.endsAt) return "live";
    if (now - match.endsAt <= RECENT_WINDOW_MS) return "recent";
    return "ended";
  }

  const liveWindow = getLiveWindowMs(match.category);
  if (startsIn <= 0 && Math.abs(startsIn) <= liveWindow) return "live";
  if (Math.abs(startsIn) <= liveWindow + RECENT_WINDOW_MS) return "recent";
  return "ended";
}

export function getHeatScore(match: SportMatch, now = Date.now()) {
  const status = getMatchStatus(match, now);
  const sourceScore = Math.min(match.sources.length * 10, 30);
  const viewerScore = Math.min(Math.floor((match.viewers ?? 0) / 5), 24);
  const popularScore = match.popular ? 16 : 6;
  const isGenericChannel = match.category === "24-7-streams";

  let timingScore = 6;
  if (status === "live") {
    timingScore = match.alwaysLive ? (isGenericChannel ? 12 : 24) : 34;
  } else if (status === "upcoming") {
    timingScore = Math.max(6, 28 - Math.floor((match.date - now) / 1800000));
  }

  return Math.max(1, Math.min(100, sourceScore + viewerScore + popularScore + timingScore));
}

export function normalizeMatch(match: SportMatch, now = Date.now()): NormalizedMatch {
  return {
    ...match,
    heatScore: getHeatScore(match, now),
    status: getMatchStatus(match, now),
    startsInMs: match.alwaysLive ? 0 : match.date - now,
  };
}

export function normalizeMatches(matches: SportMatch[], now = Date.now()) {
  return matches.map((match) => normalizeMatch(match, now));
}

export function sortByHeat(matches: SportMatch[], now = Date.now()) {
  return [...matches].sort((a, b) => getHeatScore(b, now) - getHeatScore(a, now));
}

export function formatSportName(sport: string) {
  if (sport === "24-7-streams") return "24/7 Streams";
  return sport
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMatchDate(timestamp: number, alwaysLive = false) {
  if (alwaysLive || timestamp <= 0) return "24/7 Always Live";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export function getCountdownLabel(
  timestamp: number,
  now = Date.now(),
  category?: string,
  alwaysLive = false,
  endsAt?: number
) {
  if (alwaysLive || timestamp <= 0) return "Live 24/7";
  const diff = timestamp - now;
  if (diff <= 0) {
    if (endsAt && endsAt > timestamp) {
      return now <= endsAt ? "Live now" : "Recently aired";
    }
    const liveWindow = getLiveWindowMs(category);
    return Math.abs(diff) <= liveWindow ? "Live now" : "Recently aired";
  }

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

const AT_SEPARATOR = /\s+(?:at|@)\s+/i;
const VS_SEPARATOR = /\s+vs\.?\s+|\s+-\s+/i;

export function getMatchParticipants(match: SportMatch) {
  if (match.teams?.home?.name || match.teams?.away?.name) {
    return {
      home: match.teams?.home?.name ?? match.title,
      away: match.teams?.away?.name ?? "",
    };
  }

  const title = match.title.trim();
  if (AT_SEPARATOR.test(title)) {
    const [away = "", home = ""] = title.split(AT_SEPARATOR);
    return {
      home: home.trim() || title,
      away: away.trim(),
    };
  }

  if (VS_SEPARATOR.test(title)) {
    const [home = "", away = ""] = title.split(VS_SEPARATOR);
    return {
      home: home.trim() || title,
      away: away.trim(),
    };
  }

  return {
    home: title,
    away: "",
  };
}

export function findMatchBySource(matches: SportMatch[], source: string, id: string) {
  return matches.find(
    (match) =>
      match.id === id ||
      match.sources.some((candidate) => candidate.source === source && candidate.id === id)
  );
}

export function buildMatchInsights(match: SportMatch, streams: SportStream[] = []): MatchInsight[] {
  const effectiveStreams = streams.length > 0 ? streams : (match.embeddedStreams ?? []);
  const status = getMatchStatus(match);
  const heat = getHeatScore(match);
  const hdStreams = effectiveStreams.filter((stream) => stream.hd).length;
  const totalViewers =
    effectiveStreams.reduce((sum, stream) => sum + (stream.viewers ?? 0), 0) || (match.viewers ?? 0);

  return [
    {
      label: "Pulse",
      value: heat > 78 ? "Peak demand" : heat > 54 ? "Building fast" : "Available signal",
      tone: heat > 78 ? "orange" : "lime",
    },
    {
      label: "Coverage",
      value: `${match.sources.length} feed${match.sources.length === 1 ? "" : "s"} detected`,
      tone: "cyan",
    },
    {
      label: "Quality",
      value:
        effectiveStreams.length > 0
          ? `${hdStreams}/${effectiveStreams.length} HD feeds`
          : "Streams reveal on open",
      tone: effectiveStreams.length > 0 ? "lime" : "muted",
    },
    {
      label: "Audience",
      value:
        totalViewers > 0
          ? `${totalViewers.toLocaleString()} viewers`
          : status === "live"
            ? "Live activity"
            : match.league || "Pre-match watchlist",
      tone: totalViewers > 100 ? "orange" : "muted",
    },
  ];
}

export function dedupeMatches(matches: SportMatch[]) {
  const seen = new Set<string>();
  return matches.filter((match) => {
    if (seen.has(match.id)) return false;
    seen.add(match.id);
    return true;
  });
}

