import rawTeamCatalog from "@/lib/ppv/team-catalog.json";
import {
  countryFlagUrl,
  getCountryNameByCode,
  normalizeLookupKey,
  resolveCountry,
} from "@/lib/ppv/countries";
import { parseTitleParticipants } from "@/lib/ppv/selectors";
import type { SportMatchTeams, SportTeam } from "@/lib/ppv/types";

type CatalogTuple = [string, string];
type SportBucket =
  | "american-football"
  | "basketball"
  | "hockey"
  | "baseball"
  | "australian-football"
  | "football";

const TEAM_CATALOG = rawTeamCatalog as unknown as Record<string, Record<string, CatalogTuple>>;

export function expandEspnLogoUrl(tokenOrUrl?: string): string {
  if (!tokenOrUrl) return "";
  if (tokenOrUrl.startsWith("http://") || tokenOrUrl.startsWith("https://")) {
    return tokenOrUrl;
  }
  const slashIdx = tokenOrUrl.indexOf("/");
  if (slashIdx <= 0) return "";
  const folder = tokenOrUrl.slice(0, slashIdx);
  const id = tokenOrUrl.slice(slashIdx + 1);
  return `https://a.espncdn.com/i/teamlogos/${folder}/500/${id}.png`;
}

export function resolveSportBucket(category?: string, league?: string): SportBucket {
  const c = (category ?? "").toLowerCase();
  const l = (league ?? "").toLowerCase();
  if (c.includes("australian") || l.includes("afl") || l.includes("footy")) return "australian-football";
  if (c.includes("american-football") || l.includes("nfl") || l.includes("college football")) return "american-football";
  if (c.includes("basketball") || l.includes("nba") || l.includes("wnba") || l.includes("college basketball")) {
    return "basketball";
  }
  if (c.includes("hockey") || l.includes("nhl")) return "hockey";
  if (c.includes("baseball") || l.includes("mlb")) return "baseball";
  return "football";
}

const INTERNATIONAL_TAG_RE =
  /\b(world cup|nations league|afcon|africa cup|euro|copa america|gold cup|qualif|friendly|olympic|six nations|rugby championship|davis cup|billie jean|asia cup|asian cup|fifa|conmebol|concacaf)\b/i;

const CLUB_TOKEN_STRIP_RE =
  /^(?:fc|cf|sc|ac|as|afc|fk|sk|sv|vfb|vfl|tsg|rc|rcd|cd|ca|ud|sd|ss|us|ogc|rb|bsc|krc|fsv|sl)\s+|\s+(?:fc|cf|sc|afc|ac|fk|sk|sv|bk)$/gi;

function lookupCatalogTuple(name: string, category?: string, league?: string): CatalogTuple | undefined {
  const normalized = normalizeLookupKey(name);
  if (!normalized) return undefined;

  const primary = resolveSportBucket(category, league);
  const candidateBuckets: SportBucket[] =
    primary === "american-football"
      ? ["american-football", "basketball"]
      : primary === "basketball"
        ? ["basketball", "american-football"]
        : [primary];

  const stripped = normalized
    .replace(CLUB_TOKEN_STRIP_RE, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const bucketName of candidateBuckets) {
    const bucket = TEAM_CATALOG[bucketName];
    if (!bucket) continue;
    if (bucket[normalized]) return bucket[normalized];
    if (stripped && stripped.length >= 4 && bucket[stripped]) return bucket[stripped];
  }

  return undefined;
}

const LEAGUE_COUNTRY_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\b(nfl|college football|ncaaf|nba|wnba|ncaa|college basketball|ncaab|mlb|nwsl)\b/i, "us"],
  [/\b(cfl|canadian football)\b/i, "ca"],
  [/\b(afl|footy|nrl|nbl)\b/i, "au"],
  [/\b(premier league|championship|efl|fa cup|carabao|league one|league two)\b/i, "gb-eng"],
  [/\b(scottish|spfl)\b/i, "gb-sct"],
  [/\b(la liga|copa del rey)\b/i, "es"],
  [/\b(serie a|serie b|coppa italia)\b/i, "it"],
  [/\b(bundesliga|dfb)\b/i, "de"],
  [/\b(ligue 1|ligue 2|coupe de france)\b/i, "fr"],
  [/\b(primeira liga|liga portugal)\b/i, "pt"],
  [/\b(eredivisie)\b/i, "nl"],
  [/\b(super lig|turkish)\b/i, "tr"],
  [/\b(liga mx)\b/i, "mx"],
  [/\b(brasileirao|copa do brasil)\b/i, "br"],
  [/\b(saudi pro)\b/i, "sa"],
  [/\b(j1 league|j league)\b/i, "jp"],
  [/\b(wwe|aew|ufc)\b/i, "us"],
];

interface SingleEventPreset {
  pattern: RegExp;
  badge?: string;
  countryCode: string;
}

const SINGLE_EVENT_PRESETS: ReadonlyArray<SingleEventPreset> = [
  { pattern: /\bnfl\b/i, badge: "https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png", countryCode: "us" },
  { pattern: /\bnba\b/i, badge: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png", countryCode: "us" },
  { pattern: /\bnhl\b/i, badge: "https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png", countryCode: "us" },
  { pattern: /\bmlb\b/i, badge: "https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png", countryCode: "us" },
  { pattern: /\b(fox footy|afl)\b/i, badge: "https://a.espncdn.com/i/teamlogos/leagues/500/afl.png", countryCode: "au" },
  { pattern: /\b(fox league|nrl)\b/i, countryCode: "au" },
  { pattern: /\bsky sports\b/i, countryCode: "gb" },
  { pattern: /\b(tsn|sportsnet)\b/i, countryCode: "ca" },
  { pattern: /\b(wwe|aew|ufc|cnn|fox news|south park|family guy|simpsons|spongebob)\b/i, countryCode: "us" },
];

export function inferCountryFromLeague(league?: string): string | undefined {
  if (!league) return undefined;
  for (const [pattern, code] of LEAGUE_COUNTRY_RULES) {
    if (pattern.test(league)) return code;
  }
  return undefined;
}

const ESPN_LEAGUE_PREFIX_TO_CC: ReadonlyArray<readonly [RegExp, string]> = [
  [/^(nba|wnba|nfl|mlb|mens-college-basketball|womens-college-basketball|college-football|usa\.|nwsl)/i, "us"],
  [/^(nhl)/i, "us"],
  [/^(eng\.)/i, "gb-eng"],
  [/^(sco\.)/i, "gb-sct"],
  [/^(esp\.)/i, "es"],
  [/^(ita\.)/i, "it"],
  [/^(ger\.)/i, "de"],
  [/^(fra\.)/i, "fr"],
  [/^(por\.)/i, "pt"],
  [/^(ned\.)/i, "nl"],
  [/^(bel\.)/i, "be"],
  [/^(tur\.)/i, "tr"],
  [/^(mex\.)/i, "mx"],
  [/^(arg\.)/i, "ar"],
  [/^(bra\.)/i, "br"],
  [/^(ksa\.)/i, "sa"],
  [/^(jpn\.)/i, "jp"],
  [/^(aus\.|afl)/i, "au"],
  [/^(gre\.)/i, "gr"],
  [/^(sui\.)/i, "ch"],
  [/^(aut\.)/i, "at"],
  [/^(den\.)/i, "dk"],
  [/^(nor\.)/i, "no"],
  [/^(swe\.)/i, "se"],
  [/^(chi\.)/i, "cl"],
  [/^(col\.)/i, "co"],
  [/^(rsa\.)/i, "za"],
  [/^(rou\.)/i, "ro"],
  [/^(rus\.)/i, "ru"],
  [/^(chn\.)/i, "cn"],
  [/^(idn\.)/i, "id"],
  [/^(pol\.)/i, "pl"],
  [/^(cze\.)/i, "cz"],
  [/^(ukr\.)/i, "ua"],
  [/^(egy\.)/i, "eg"],
  [/^(mar\.)/i, "ma"],
];

export function espnLeagueToCountryCode(espnLeague?: string, teamName?: string): string | undefined {
  if (!espnLeague) return undefined;
  const key = normalizeLookupKey(teamName);
  if (
    espnLeague.startsWith("nhl") ||
    espnLeague.startsWith("nba") ||
    espnLeague.startsWith("mlb") ||
    espnLeague.startsWith("usa.")
  ) {
    if (/^(toronto|montreal|vancouver|calgary|edmonton|ottawa|winnipeg|cf montreal)\b/.test(key)) {
      return "ca";
    }
  }
  for (const [pattern, cc] of ESPN_LEAGUE_PREFIX_TO_CC) {
    if (pattern.test(espnLeague)) return cc;
  }
  return undefined;
}

export function resolveStaticTeamVisual(
  name: string,
  category?: string,
  league?: string,
  preferNational = false
): SportTeam {
  const cleanName = name.trim();
  const baseTeam: SportTeam = { name: cleanName };
  if (!cleanName) return baseTeam;

  if (preferNational) {
    const country = resolveCountry(cleanName);
    if (country) {
      return {
        name: cleanName,
        badge: countryFlagUrl(country.code),
        countryCode: country.code,
        countryName: country.name,
        isNational: true,
      };
    }
  }

  const tuple = lookupCatalogTuple(cleanName, category, league);
  if (tuple) {
    const [token, cc] = tuple;
    const countryCode = cc || inferCountryFromLeague(league);
    return {
      name: cleanName,
      badge: expandEspnLogoUrl(token),
      countryCode,
      countryName: getCountryNameByCode(countryCode),
      isNational: false,
    };
  }

  const countryFallback = resolveCountry(cleanName);
  if (countryFallback) {
    return {
      name: cleanName,
      badge: countryFlagUrl(countryFallback.code),
      countryCode: countryFallback.code,
      countryName: countryFallback.name,
      isNational: true,
    };
  }

  const leagueCc = inferCountryFromLeague(league);
  if (leagueCc) {
    return {
      name: cleanName,
      countryCode: leagueCc,
      countryName: getCountryNameByCode(leagueCc),
    };
  }

  return baseTeam;
}

export function resolveMatchVisuals(params: {
  title: string;
  category?: string;
  league?: string;
  alwaysLive?: boolean;
  serverTeams?: SportMatchTeams;
  serverCountry?: { code: string; name: string };
}): {
  teams: SportMatchTeams;
  countryCode?: string;
  countryName?: string;
} {
  const { home, away } = parseTitleParticipants(params.title);

  // Merge with any pre-enriched server team data first
  const mergeTeam = (parsedName: string, staticResolved: SportTeam, serverTeam?: SportTeam): SportTeam => {
    if (!serverTeam) return staticResolved;
    return {
      name: serverTeam.name || parsedName,
      badge: staticResolved.badge || serverTeam.badge,
      countryCode: staticResolved.countryCode || serverTeam.countryCode,
      countryName: staticResolved.countryName || serverTeam.countryName,
      isNational: staticResolved.isNational ?? serverTeam.isNational,
    };
  };

  if (!away) {
    // Single broadcast / channel / show / wrestling event
    const preset = SINGLE_EVENT_PRESETS.find((p) => p.pattern.test(params.title));
    const staticHome = resolveStaticTeamVisual(home, params.category, params.league, false);
    const serverHome = params.serverTeams?.home;
    const cc = preset?.countryCode || staticHome.countryCode || serverHome?.countryCode || params.serverCountry?.code;
    const cName = getCountryNameByCode(cc) || params.serverCountry?.name || staticHome.countryName;

    const mergedHome: SportTeam = {
      name: home,
      badge: preset?.badge || staticHome.badge || serverHome?.badge,
      countryCode: cc,
      countryName: cName,
      isNational: staticHome.isNational ?? serverHome?.isNational,
    };

    return {
      teams: { home: mergedHome },
      countryCode: cc,
      countryName: cName,
    };
  }

  const internationalContext = Boolean(params.league && INTERNATIONAL_TAG_RE.test(params.league));
  const preferNational =
    internationalContext ||
    (Boolean(resolveCountry(home)) && Boolean(resolveCountry(away)) &&
      resolveSportBucket(params.category, params.league) === "football");

  const staticHome = resolveStaticTeamVisual(home, params.category, params.league, preferNational);
  const staticAway = resolveStaticTeamVisual(away, params.category, params.league, preferNational);

  const mergedHome = mergeTeam(home, staticHome, params.serverTeams?.home);
  const mergedAway = mergeTeam(away, staticAway, params.serverTeams?.away);

  let countryCode = params.serverCountry?.code;
  if (!countryCode && mergedHome.countryCode && mergedHome.countryCode === mergedAway.countryCode && !mergedHome.isNational) {
    countryCode = mergedHome.countryCode;
  } else if (!countryCode) {
    countryCode = inferCountryFromLeague(params.league);
  }

  return {
    teams: { home: mergedHome, away: mergedAway },
    countryCode,
    countryName: countryCode ? getCountryNameByCode(countryCode) || params.serverCountry?.name : undefined,
  };
}

