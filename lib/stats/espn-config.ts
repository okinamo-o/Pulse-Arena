/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SportType } from "@/lib/streamed/types";

/**
 * Maps a streamed-API category string to a recognised SportType.
 */
export function resolveSportType(category: string): SportType {
  const c = category.toLowerCase();
  if (c === "football" || c === "soccer") return "football";
  if (c === "basketball") return "basketball";
  if (c === "tennis") return "tennis";
  if (c === "hockey" || c === "ice-hockey") return "hockey";
  if (c === "baseball") return "baseball";
  if (c === "cricket") return "cricket";
  if (c === "american-football") return "american-football";
  return "unknown";
}

export interface EspnSportConfig {
  /** ESPN URL path segment, e.g. "soccer/all" */
  paths: string[];
  hasLineups: boolean;
  hasStandings: boolean;
}

/** ESPN sport path chains — we try each until we find the match */
export const ESPN_SPORT_CONFIG: Record<SportType, EspnSportConfig> = {
  football: {
    paths: ["soccer/all"],
    hasLineups: true,
    hasStandings: true,
  },
  basketball: {
    paths: ["basketball/nba", "basketball/mens-college-basketball", "basketball/wnba"],
    hasLineups: true,
    hasStandings: true,
  },
  tennis: {
    paths: ["tennis/atp", "tennis/wta"],
    hasLineups: false,
    hasStandings: false,
  },
  hockey: {
    paths: ["hockey/nhl"],
    hasLineups: true,
    hasStandings: true,
  },
  baseball: {
    paths: ["baseball/mlb"],
    hasLineups: true,
    hasStandings: true,
  },
  cricket: {
    paths: ["cricket/icc"],
    hasLineups: true,
    hasStandings: true,
  },
  "american-football": {
    paths: ["football/nfl", "football/college-football"],
    hasLineups: true,
    hasStandings: true,
  },
  unknown: {
    paths: [],
    hasLineups: false,
    hasStandings: false,
  },
};

/**
 * Search across ESPN scoreboard path(s) for a match matching home/away.
 * Returns { targetEvent, scoreboardData, sportPath } or null.
 */
export async function findMatchOnEspn(
  home: string,
  away: string,
  sportType: SportType
): Promise<{ targetEvent: any; scoreboardData: any; sportPath: string } | null> {
  const config = ESPN_SPORT_CONFIG[sportType];
  if (!config || config.paths.length === 0) return null;

  const t = Math.floor(Date.now() / 5000);
  const normalizedHome = home.toLowerCase();
  const normalizedAway = away.toLowerCase();

  for (const sportPath of config.paths) {
    try {
      const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?_=${t}`;
      const scoreboardRes = await fetch(scoreboardUrl, {
        next: { revalidate: 5 },
        signal: AbortSignal.timeout(8000),
      });
      if (!scoreboardRes.ok) continue;
      const scoreboardData = await scoreboardRes.json();

      if (!scoreboardData.events) continue;

      for (const event of scoreboardData.events) {
        const eventName = (event.name || event.shortName || "").toLowerCase();
        if (eventName.includes(normalizedHome) && eventName.includes(normalizedAway)) {
          return { targetEvent: event, scoreboardData, sportPath };
        }
        // Also try competitor names directly
        const comps = event.competitions?.[0]?.competitors || [];
        const compNames = comps.map((c: any) => (c.team?.displayName || c.team?.shortDisplayName || "").toLowerCase());
        if (
          compNames.some((n: string) => n.includes(normalizedHome) || normalizedHome.includes(n)) &&
          compNames.some((n: string) => n.includes(normalizedAway) || normalizedAway.includes(n))
        ) {
          return { targetEvent: event, scoreboardData, sportPath };
        }
      }
    } catch {
      // try next path
    }
  }
  return null;
}

/**
 * Fetch the ESPN match summary for a given game ID and sport path.
 */
export async function fetchEspnSummary(gameId: string, sportPath: string): Promise<any> {
  const t = Math.floor(Date.now() / 5000);
  const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}&_=${t}`;
  const summaryRes = await fetch(summaryUrl, {
    next: { revalidate: 5 },
    signal: AbortSignal.timeout(8000),
  });
  if (!summaryRes.ok) throw new Error("Failed to fetch ESPN Summary");
  return summaryRes.json();
}
