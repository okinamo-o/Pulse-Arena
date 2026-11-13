import fs from "node:fs";
import path from "node:path";

const PREFIX_LOGO_RE = /^https:\/\/a\.espncdn\.com\/i\/teamlogos\/([^/]+)\/500\/([^/]+)\.png$/i;

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const CANADIAN_PRO_OR_MLS = new Set([
  "toronto raptors",
  "toronto tempo",
  "montreal canadiens",
  "toronto maple leafs",
  "ottawa senators",
  "winnipeg jets",
  "calgary flames",
  "edmonton oilers",
  "vancouver canucks",
  "toronto blue jays",
  "cf montreal",
  "toronto fc",
  "vancouver whitecaps",
  "vancouver whitecaps fc",
]);

const WELSH_EFL = new Set([
  "cardiff city",
  "swansea city",
  "wrexham",
  "wrexham afc",
  "newport county",
]);

const MONEGASQUE_L1 = new Set(["as monaco", "monaco"]);
const ANDORRAN_ESP = new Set(["fc andorra", "andorra"]);
const LIECHTENSTEIN_SUI = new Set(["fc vaduz", "vaduz"]);

function resolveCountryForTeam(displayName, defaultCountry) {
  const k = normalizeKey(displayName);
  if (defaultCountry === "us" && CANADIAN_PRO_OR_MLS.has(k)) return "ca";
  if (defaultCountry === "au" && k === "new zealand breakers") return "nz";
  if (defaultCountry === "gb-eng" && WELSH_EFL.has(k)) return "gb-wls";
  if (defaultCountry === "fr" && MONEGASQUE_L1.has(k)) return "mc";
  if (defaultCountry === "es" && ANDORRAN_ESP.has(k)) return "ad";
  if (defaultCountry === "ch" && LIECHTENSTEIN_SUI.has(k)) return "li";
  return defaultCountry;
}

function compactLogo(team) {
  const logos = Array.isArray(team.logos) ? team.logos : [];
  const primary =
    logos.find((l) => !Array.isArray(l.rel) || l.rel.includes("default"))?.href ||
    logos[0]?.href ||
    "";
  if (!primary) return "";
  const match = primary.match(PREFIX_LOGO_RE);
  if (match) return `${match[1]}/${match[2]}`;
  return primary;
}

const SOURCES = [
  // Pro US / CA
  { path: "football/nfl", cc: "us", bucket: "american-football", limit: 100 },
  { path: "football/college-football", cc: "us", bucket: "american-football", limit: 1000 },
  { path: "basketball/nba", cc: "us", bucket: "basketball", limit: 100 },
  { path: "basketball/wnba", cc: "us", bucket: "basketball", limit: 100 },
  { path: "basketball/nbl", cc: "au", bucket: "basketball", limit: 50 },
  { path: "basketball/euroleague", cc: "", bucket: "basketball", limit: 50 },
  { path: "basketball/mens-college-basketball", cc: "us", bucket: "basketball", limit: 500 },
  { path: "hockey/nhl", cc: "us", bucket: "hockey", limit: 100 },
  { path: "baseball/mlb", cc: "us", bucket: "baseball", limit: 100 },
  { path: "australian-football/afl", cc: "au", bucket: "australian-football", limit: 100 },

  // Domestic Football (priority order sets domestic country flags accurately)
  { path: "soccer/eng.1", cc: "gb-eng", bucket: "football", limit: 100 },
  { path: "soccer/eng.2", cc: "gb-eng", bucket: "football", limit: 100 },
  { path: "soccer/eng.3", cc: "gb-eng", bucket: "football", limit: 100 },
  { path: "soccer/esp.1", cc: "es", bucket: "football", limit: 100 },
  { path: "soccer/esp.2", cc: "es", bucket: "football", limit: 100 },
  { path: "soccer/ita.1", cc: "it", bucket: "football", limit: 100 },
  { path: "soccer/ita.2", cc: "it", bucket: "football", limit: 100 },
  { path: "soccer/ger.1", cc: "de", bucket: "football", limit: 100 },
  { path: "soccer/ger.2", cc: "de", bucket: "football", limit: 100 },
  { path: "soccer/fra.1", cc: "fr", bucket: "football", limit: 100 },
  { path: "soccer/fra.2", cc: "fr", bucket: "football", limit: 100 },
  { path: "soccer/por.1", cc: "pt", bucket: "football", limit: 100 },
  { path: "soccer/ned.1", cc: "nl", bucket: "football", limit: 100 },
  { path: "soccer/bel.1", cc: "be", bucket: "football", limit: 100 },
  { path: "soccer/tur.1", cc: "tr", bucket: "football", limit: 100 },
  { path: "soccer/sco.1", cc: "gb-sct", bucket: "football", limit: 100 },
  { path: "soccer/usa.1", cc: "us", bucket: "football", limit: 100 },
  { path: "soccer/mex.1", cc: "mx", bucket: "football", limit: 100 },
  { path: "soccer/arg.1", cc: "ar", bucket: "football", limit: 100 },
  { path: "soccer/bra.1", cc: "br", bucket: "football", limit: 100 },
  { path: "soccer/ksa.1", cc: "sa", bucket: "football", limit: 100 },
  { path: "soccer/jpn.1", cc: "jp", bucket: "football", limit: 100 },
  { path: "soccer/aus.1", cc: "au", bucket: "football", limit: 100 },
  { path: "soccer/gre.1", cc: "gr", bucket: "football", limit: 100 },
  { path: "soccer/sui.1", cc: "ch", bucket: "football", limit: 100 },
  { path: "soccer/aut.1", cc: "at", bucket: "football", limit: 100 },
  { path: "soccer/den.1", cc: "dk", bucket: "football", limit: 100 },
  { path: "soccer/nor.1", cc: "no", bucket: "football", limit: 100 },
  { path: "soccer/swe.1", cc: "se", bucket: "football", limit: 100 },
  { path: "soccer/chi.1", cc: "cl", bucket: "football", limit: 100 },
  { path: "soccer/col.1", cc: "co", bucket: "football", limit: 100 },
  { path: "soccer/rsa.1", cc: "za", bucket: "football", limit: 100 },
  { path: "soccer/rou.1", cc: "ro", bucket: "football", limit: 100 },
  { path: "soccer/rus.1", cc: "ru", bucket: "football", limit: 100 },
  { path: "soccer/chn.1", cc: "cn", bucket: "football", limit: 100 },
  { path: "soccer/idn.1", cc: "id", bucket: "football", limit: 100 },

  // Continental cups (club crest fallback for teams not in domestic lists above)
  { path: "soccer/uefa.champions", cc: "", bucket: "football", limit: 100 },
  { path: "soccer/uefa.europa", cc: "", bucket: "football", limit: 100 },
  { path: "soccer/uefa.europa.conf", cc: "", bucket: "football", limit: 100 },
  { path: "soccer/conmebol.libertadores", cc: "", bucket: "football", limit: 100 },
  { path: "soccer/afc.champions", cc: "", bucket: "football", limit: 100 },
  { path: "soccer/caf.champions", cc: "", bucket: "football", limit: 100 },
  { path: "soccer/concacaf.champions", cc: "", bucket: "football", limit: 100 },
];

const MANUAL_SOCCER_ALIASES = {
  "man united": "manchester united",
  "man utd": "manchester united",
  "man city": "manchester city",
  "psg": "paris saint germain",
  "spurs": "tottenham hotspur",
  "tottenham": "tottenham hotspur",
  "wolves": "wolverhampton wanderers",
  "brighton": "brighton and hove albion",
  "newcastle": "newcastle united",
  "west ham": "west ham united",
  "nottm forest": "nottingham forest",
  "leicester": "leicester city",
  "leeds": "leeds united",
  "sheff utd": "sheffield united",
  "inter": "internazionale",
  "inter milan": "internazionale",
  "ac milan": "ac milan",
  "atletico": "atletico madrid",
  "atleti": "atletico madrid",
  "bayern": "bayern munich",
  "bayern munchen": "bayern munich",
  "dortmund": "borussia dortmund",
  "leverkusen": "bayer leverkusen",
  "gladbach": "borussia monchengladbach",
  "rb leipzig": "rb leipzig",
  "stuttgart": "vfb stuttgart",
  "frankfurt": "eintracht frankfurt",
  "olympique lyon": "lyon",
  "olympique marseille": "marseille",
  "om": "marseille",
  "ol": "lyon",
  "sporting cp": "sporting cp",
  "sporting lisbon": "sporting cp",
  "fc porto": "porto",
  "sl benfica": "benfica",
  "ajax": "ajax",
  "psv": "psv eindhoven",
  "feyenoord": "feyenoord",
};

const AMBIGUOUS_SHORT_NAMES = new Set([
  "united",
  "city",
  "real",
  "inter",
  "athletic",
  "sporting",
  "rangers",
  "rovers",
  "wanderers",
  "albion",
  "town",
  "athletics",
  "cardinals",
  "tigers",
  "wildcats",
  "bulldogs",
  "eagles",
  "hawks",
  "panthers",
  "bears",
  "lions",
  "aggies",
  "cougars",
  "spartans",
  "huskies",
  "warriors",
  "knights",
]);

async function fetchLeagueTeams(source) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${source.path}/teams?limit=${source.limit}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`WARN ${source.path} -> ${res.status}`);
      return [];
    }
    const json = await res.json();
    const teams = json.sports?.[0]?.leagues?.[0]?.teams || [];
    return teams.map((entry) => entry.team).filter(Boolean);
  } catch (err) {
    console.warn(`ERR ${source.path}: ${err.message}`);
    return [];
  }
}

async function main() {
  const results = await Promise.all(
    SOURCES.map(async (src) => ({ src, teams: await fetchLeagueTeams(src) }))
  );

  const catalog = {};

  for (const { src, teams } of results) {
    if (!catalog[src.bucket]) catalog[src.bucket] = {};
    const bucket = catalog[src.bucket];

    for (const team of teams) {
      const logo = compactLogo(team);
      if (!logo) continue;
      const cc = src.cc ? resolveCountryForTeam(team.displayName, src.cc) : "";
      const tuple = [logo, cc];

      const displayKey = normalizeKey(team.displayName);
      if (displayKey && !bucket[displayKey]) {
        bucket[displayKey] = tuple;
      }

      const shortKey = normalizeKey(team.shortDisplayName);
      if (
        shortKey &&
        shortKey.length >= 4 &&
        !AMBIGUOUS_SHORT_NAMES.has(shortKey) &&
        !bucket[shortKey]
      ) {
        bucket[shortKey] = tuple;
      }

      // Add NCAA school-only key if unambiguous (e.g. "ucla", "alabama", "uconn")
      if (src.path.includes("college-") && team.location) {
        const locKey = normalizeKey(team.location);
        if (
          locKey &&
          locKey.length >= 4 &&
          !AMBIGUOUS_SHORT_NAMES.has(locKey) &&
          !bucket[locKey]
        ) {
          bucket[locKey] = tuple;
        }
      }
    }
  }

  // Apply explicit soccer aliases
  if (catalog.football) {
    for (const [alias, target] of Object.entries(MANUAL_SOCCER_ALIASES)) {
      if (catalog.football[target] && !catalog.football[alias]) {
        catalog.football[alias] = catalog.football[target];
      }
    }
  }

  const outPath = path.resolve("lib/ppv/team-catalog.json");
  fs.writeFileSync(outPath, JSON.stringify(catalog));
  const counts = Object.fromEntries(
    Object.entries(catalog).map(([k, v]) => [k, Object.keys(v).length])
  );
  const bytes = fs.statSync(outPath).size;
  console.log("Generated", outPath, `${(bytes / 1024).toFixed(1)} KB`, counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

