/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCountryNameByCode, normalizeLookupKey } from "@/lib/ppv/countries";
import { parseTitleParticipants } from "@/lib/ppv/selectors";
import { espnLeagueToCountryCode, resolveMatchVisuals } from "@/lib/ppv/team-visuals";
import type { PpvRawCategoryGroup, SportTeam } from "@/lib/ppv/types";

interface CachedTeamHit {
  badge?: string;
  countryCode?: string;
  expiresAt: number;
}

const HIT_TTL_MS = 12 * 60 * 60 * 1000;
const NEGATIVE_HIT_TTL_MS = 30 * 60 * 1000;
const SCOREBOARD_TTL_MS = 10 * 60 * 1000;
const MAX_DYNAMIC_SEARCHES_PER_BATCH = 10;

const dynamicTeamCache = new Map<string, CachedTeamHit>();
let scoreboardCache: { expiresAt: number; teamsByKey: Map<string, CachedTeamHit> } = {
  expiresAt: 0,
  teamsByKey: new Map(),
};
let scoreboardInflight: Promise<Map<string, CachedTeamHit>> | null = null;

function mapCategoryToEspnSports(category: string): string[] {
  const c = category.toLowerCase();
  if (c.includes("american-football")) return ["football"];
  if (c.includes("basketball")) return ["basketball"];
  if (c.includes("hockey")) return ["hockey"];
  if (c.includes("baseball")) return ["baseball"];
  if (c.includes("rugby")) return ["rugby", "rugby-league"];
  if (c.includes("australian")) return ["australian-football"];
  if (c.includes("cricket")) return ["cricket"];
  if (c.includes("football")) return ["soccer"];
  return [];
}

function teamNamesOverlap(queryName: string, candidateName: string): boolean {
  const q = normalizeLookupKey(queryName);
  const c = normalizeLookupKey(candidateName);
  if (!q || !c) return false;
  if (q === c || c.includes(q) || q.includes(c)) return true;

  const qTokens = new Set(q.split(" ").filter((t) => t.length >= 3));
  const cTokens = c.split(" ").filter((t) => t.length >= 3);
  if (qTokens.size === 0 || cTokens.length === 0) return false;

  const overlap = cTokens.filter((t) => qTokens.has(t)).length;
  return overlap >= Math.min(2, qTokens.size);
}

async function getActiveScoreboardTeams(): Promise<Map<string, CachedTeamHit>> {
  const now = Date.now();
  if (now < scoreboardCache.expiresAt) {
    return scoreboardCache.teamsByKey;
  }
  if (scoreboardInflight) {
    return scoreboardInflight;
  }

  scoreboardInflight = (async () => {
    const map = new Map<string, CachedTeamHit>();
    const paths = ["soccer/all/scoreboard", "rugby/all/scoreboard"];

    await Promise.allSettled(
      paths.map(async (p) => {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${p}`, {
            signal: AbortSignal.timeout(1800),
            headers: { accept: "application/json" },
          });
          if (!res.ok) return;
          const data = await res.json();
          for (const ev of data.events ?? []) {
            const leagueSlug = ev.league?.slug || ev.season?.slug || "";
            for (const comp of ev.competitions?.[0]?.competitors ?? []) {
              const t = comp.team;
              if (!t) continue;
              const logo = t.logo || t.logos?.[0]?.href;
              if (!logo) continue;
              const cc = espnLeagueToCountryCode(leagueSlug, t.displayName);
              const entry: CachedTeamHit = { badge: logo, countryCode: cc, expiresAt: now + HIT_TTL_MS };
              for (const rawName of [t.displayName, t.shortDisplayName, t.name]) {
                const k = normalizeLookupKey(rawName);
                if (k && !map.has(k)) {
                  map.set(k, entry);
                }
              }
            }
          }
        } catch {
          // Best-effort scoreboard warm cache
        }
      })
    );

    scoreboardCache = {
      expiresAt: Date.now() + SCOREBOARD_TTL_MS,
      teamsByKey: map,
    };
    scoreboardInflight = null;
    return map;
  })();

  return scoreboardInflight;
}

async function searchEspnTeam(teamName: string, category: string): Promise<CachedTeamHit> {
  const cacheKey = `${category}::${normalizeLookupKey(teamName)}`;
  const cached = dynamicTeamCache.get(cacheKey);
  const now = Date.now();
  if (cached && now < cached.expiresAt) {
    return cached;
  }

  const allowedSports = mapCategoryToEspnSports(category);
  if (allowedSports.length === 0) {
    const neg: CachedTeamHit = { expiresAt: now + NEGATIVE_HIT_TTL_MS };
    dynamicTeamCache.set(cacheKey, neg);
    return neg;
  }

  try {
    const url = `https://site.api.espn.com/apis/common/v3/search?query=${encodeURIComponent(teamName)}&type=team&limit=5`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(1800),
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return { expiresAt: now + NEGATIVE_HIT_TTL_MS };
    }
    const json = await res.json();
    const items: any[] = Array.isArray(json.items) ? json.items : [];

    const matchItem = items.find((item) => {
      const sport = String(item.sport ?? "").toLowerCase();
      if (!allowedSports.includes(sport)) return false;
      return teamNamesOverlap(teamName, item.displayName || item.name || "");
    });

    const badge = matchItem?.logos?.[0]?.href || undefined;
    const countryCode = espnLeagueToCountryCode(matchItem?.league, matchItem?.displayName || teamName);
    const result: CachedTeamHit = {
      badge,
      countryCode,
      expiresAt: now + (badge ? HIT_TTL_MS : NEGATIVE_HIT_TTL_MS),
    };
    dynamicTeamCache.set(cacheKey, result);
    return result;
  } catch {
    return { expiresAt: now + NEGATIVE_HIT_TTL_MS };
  }
}

/**
 * Enriches PPV category stream groups on the server with dynamic ESPN scoreboard/search logos
 * for teams not already covered by the bundled static team & country catalog.
 */
export async function enrichPpvGroupsOnServer(groups: PpvRawCategoryGroup[]): Promise<void> {
  if (!Array.isArray(groups) || groups.length === 0) return;

  const pendingByKey = new Map<string, { rawName: string; category: string }>();
  const matchCache: Array<{
    groupCat: string;
    stream: PpvRawCategoryGroup["streams"][number];
    staticVisuals: ReturnType<typeof resolveMatchVisuals>;
    homeName: string;
    awayName: string;
  }> = [];

  for (const group of groups) {
    const groupCat = group?.category || "";
    const isAlwaysLiveGroup = Boolean(group?.always_live);
    for (const stream of group?.streams ?? []) {
      if (!stream || !stream.name) continue;
      const staticVisuals = resolveMatchVisuals({
        title: stream.name,
        category: groupCat,
        league: stream.tag,
        alwaysLive: isAlwaysLiveGroup || stream.always_live === 1 || stream.always_live === true,
      });

      const { home, away } = parseTitleParticipants(stream.name);
      matchCache.push({ groupCat, stream, staticVisuals, homeName: home, awayName: away });

      if (isAlwaysLiveGroup || !away) continue;

      if (home && !staticVisuals.teams.home?.badge) {
        const k = `${groupCat}::${normalizeLookupKey(home)}`;
        if (!pendingByKey.has(k)) pendingByKey.set(k, { rawName: home, category: groupCat });
      }
      if (away && !staticVisuals.teams.away?.badge) {
        const k = `${groupCat}::${normalizeLookupKey(away)}`;
        if (!pendingByKey.has(k)) pendingByKey.set(k, { rawName: away, category: groupCat });
      }
    }
  }

  let scoreboardTeams: Map<string, CachedTeamHit> | null = null;
  if (pendingByKey.size > 0) {
    scoreboardTeams = await getActiveScoreboardTeams();

    // Perform bounded ESPN search lookups for teams still missing from scoreboard + static cache
    const toSearch: Array<{ key: string; rawName: string; category: string }> = [];
    for (const [k, info] of pendingByKey.entries()) {
      const sbHit = scoreboardTeams.get(normalizeLookupKey(info.rawName));
      if (sbHit?.badge) continue;
      const memHit = dynamicTeamCache.get(k);
      if (memHit && Date.now() < memHit.expiresAt) continue;
      toSearch.push({ key: k, ...info });
      if (toSearch.length >= MAX_DYNAMIC_SEARCHES_PER_BATCH) break;
    }

    if (toSearch.length > 0) {
      await Promise.allSettled(toSearch.map((item) => searchEspnTeam(item.rawName, item.category)));
    }
  }

  for (const { groupCat, stream, staticVisuals, homeName, awayName } of matchCache) {
    const resolveDynamic = (name: string, current?: SportTeam): SportTeam | undefined => {
      if (!current || current.badge) return current;
      const norm = normalizeLookupKey(name);
      const hit =
        scoreboardTeams?.get(norm) ||
        dynamicTeamCache.get(`${groupCat}::${norm}`);
      if (!hit || (!hit.badge && !hit.countryCode)) return current;
      const cc = current.countryCode || hit.countryCode;
      return {
        ...current,
        badge: hit.badge || current.badge,
        countryCode: cc,
        countryName: current.countryName || getCountryNameByCode(cc),
      };
    };

    const home = resolveDynamic(homeName, staticVisuals.teams.home);
    const away = awayName ? resolveDynamic(awayName, staticVisuals.teams.away) : undefined;

    let cc = staticVisuals.countryCode;
    if (!cc && home?.countryCode && away?.countryCode && home.countryCode === away.countryCode && !home.isNational) {
      cc = home.countryCode;
    }

    stream.resolved_teams = away ? { home, away } : { home };
    const countryName = cc ? getCountryNameByCode(cc) || staticVisuals.countryName : undefined;
    if (cc && countryName) {
      stream.resolved_country = { code: cc, name: countryName };
    }
  }
}
