import { cache } from "react";
import type {
  PpvDirectory,
  PpvRawCategoryGroup,
  PpvRawStream,
  PpvRawStreamDetailResponse,
  PpvRawStreamsResponse,
  SportCategory,
  SportMatch,
  SportMatchSource,
  SportStream,
} from "@/lib/ppv/types";
import { getMatchStatus } from "@/lib/ppv/selectors";
import { resolveMatchVisuals } from "@/lib/ppv/team-visuals";

const DEFAULT_PPV_API_ORIGIN = "https://api.ppv.st";

function normalizeApiOrigin(rawOrigin?: string): string {
  const trimmed = (rawOrigin ?? DEFAULT_PPV_API_ORIGIN).trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_PPV_API_ORIGIN;
  try {
    const url = new URL(trimmed);
    if (url.hostname === "ppv.st" || url.hostname === "www.ppv.st") {
      url.hostname = "api.ppv.st";
    }
    return url.origin;
  } catch {
    return DEFAULT_PPV_API_ORIGIN;
  }
}

export const PPV_ORIGIN = normalizeApiOrigin(process.env.PPV_API_ORIGIN);
export const PPV_SITE_ORIGIN = "https://ppv.st";

type FetchMode = "server" | "browser";

function getMode(): FetchMode {
  return typeof window === "undefined" ? "server" : "browser";
}

function trimApi(path: string): string {
  return path.replace(/^\/?api\/?/, "").replace(/^\/+/, "");
}

export function ppvApiUrl(path: string, mode: FetchMode = getMode()): string {
  const clean = trimApi(path);
  if (mode === "browser") {
    return `/api/ppv/${clean}`;
  }
  return `${PPV_ORIGIN}/api/${clean}`;
}

export function slugifyCategory(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseViewers(value?: string | number): number {
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, value) : 0;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  return 0;
}

function isAlwaysLiveFlag(flag?: number | boolean | string): boolean {
  return flag === true || flag === 1 || flag === "1";
}

const MAJOR_LEAGUE_KEYWORDS = [
  "nba",
  "nfl",
  "uefa",
  "champions league",
  "europa league",
  "premier league",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "world cup",
  "nations league",
  "nhl",
  "mlb",
  "ufc",
  "formula 1",
  "f1",
  "college football",
  "wwe",
];

function isMajorLeagueTag(tag?: string): boolean {
  if (!tag) return false;
  const lower = tag.toLowerCase();
  return MAJOR_LEAGUE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function parseSourceTag(sourceTag?: string, uri?: string): { hd: boolean; label: string; slug: string } {
  const raw = (sourceTag ?? "").trim();
  const parts = raw.split("|").map((p) => p.trim()).filter(Boolean);

  let hd = !uri?.includes("_540p");
  let label = raw || "Live Feed";

  if (parts.length >= 2) {
    const qualityPart = parts[0].toUpperCase();
    hd = qualityPart !== "SD" && !uri?.includes("_540p");
    label = parts.slice(1).join(" | ");
  } else if (raw.toUpperCase().startsWith("SD")) {
    hd = false;
  } else if (raw.toUpperCase().startsWith("HD")) {
    hd = true;
  }

  const slug = slugifyCategory(label) || "ppv";
  return { hd, label, slug };
}

const localeDisplayCache = new Map<string, string>();

function formatLocaleName(locale?: string): string {
  const clean = (locale ?? "").trim();
  if (!clean) return "English";
  const cached = localeDisplayCache.get(clean);
  if (cached) return cached;

  try {
    const langCode = clean.split(/[-_]/)[0] || clean;
    const display = new Intl.DisplayNames(["en"], { type: "language" }).of(langCode);
    const regionPart = clean.split(/[-_]/)[1]?.toUpperCase();
    let formatted = display
      ? display.charAt(0).toUpperCase() + display.slice(1)
      : clean.toUpperCase();
    if (regionPart && formatted) {
      formatted = `${formatted} (${regionPart})`;
    }
    localeDisplayCache.set(clean, formatted);
    return formatted;
  } catch {
    return clean.toUpperCase();
  }
}

function resolveIframeUrl(item: { iframe?: string; sources?: { type?: string; data?: string }[] }): string {
  if (item.iframe && item.iframe.startsWith("http")) {
    return item.iframe;
  }
  if (Array.isArray(item.sources)) {
    const iframeSource = item.sources.find((s) => s.type === "iframe" && s.data?.startsWith("http"));
    if (iframeSource?.data) return iframeSource.data;
    const anyHttp = item.sources.find((s) => s.data?.startsWith("http"));
    if (anyHttp?.data) return anyHttp.data;
  }
  return "";
}

function buildStreamsFromRaw(
  raw: PpvRawStream,
  overrideViewers?: number
): SportStream[] {
  const streams: SportStream[] = [];
  const mainId = String(raw.id);
  const baseViewers = overrideViewers ?? parseViewers(raw.viewers);
  const seenEmbeds = new Set<string>();

  const pushStream = (
    id: string,
    embedUrl: string,
    sourceTag: string | undefined,
    uri: string | undefined,
    locale: string | undefined,
    viewers?: number
  ) => {
    if (!embedUrl || seenEmbeds.has(embedUrl)) return;
    seenEmbeds.add(embedUrl);
    const parsed = parseSourceTag(sourceTag, uri);
    streams.push({
      id,
      streamNo: streams.length + 1,
      language: formatLocaleName(locale ?? raw.locale),
      label: parsed.label,
      hd: parsed.hd,
      embedUrl,
      source: parsed.slug,
      viewers,
    });
  };

  if (Array.isArray(raw.sources) && raw.sources.length > 0) {
    for (const src of raw.sources) {
      if (src.data && src.data.startsWith("http")) {
        pushStream(mainId, src.data, raw.source_tag ?? src.name, raw.uri ?? raw.uri_name, raw.locale, baseViewers);
      }
    }
  } else {
    const mainEmbed = resolveIframeUrl(raw);
    pushStream(mainId, mainEmbed, raw.source_tag, raw.uri_name ?? raw.uri, raw.locale, baseViewers);
  }

  for (const sub of raw.substreams ?? []) {
    const subEmbed = resolveIframeUrl(sub);
    pushStream(
      String(sub.id),
      subEmbed,
      sub.source_tag,
      sub.uri_name ?? sub.uri,
      sub.locale ?? raw.locale,
      undefined
    );
  }

  return streams;
}

function buildSourcesList(parentId: string, embeddedStreams: SportStream[]): SportMatchSource[] {
  if (embeddedStreams.length === 0) {
    return [{ source: "ppv", id: parentId, label: "PPV" }];
  }

  const usedSources = new Set<string>();
  return embeddedStreams.map((stream) => {
    let key = stream.source || "ppv";
    if (!stream.hd && !key.endsWith("-sd")) {
      const sdCandidate = `${key}-sd`;
      key = usedSources.has(key) ? sdCandidate : key;
    }
    if (usedSources.has(key)) {
      key = `${key}-${stream.streamNo}`;
    }
    usedSources.add(key);

    return {
      source: key,
      id: parentId,
      label: `${stream.hd ? "HD" : "SD"} | ${stream.label ?? stream.source}`,
    };
  });
}

function normalizeRawStream(raw: PpvRawStream, group: PpvRawCategoryGroup): SportMatch {
  const categoryName = group.category || raw.category_name || "Sports";
  const categoryId = slugifyCategory(categoryName) || "sports";
  const alwaysLive = isAlwaysLiveFlag(raw.always_live) || isAlwaysLiveFlag(group.always_live);

  const startsAtSec = raw.starts_at ?? raw.start_timestamp ?? 0;
  const endsAtSec = raw.ends_at ?? raw.end_timestamp ?? 0;

  const date = !alwaysLive && startsAtSec > 0 ? startsAtSec * 1000 : startsAtSec > 0 ? startsAtSec * 1000 : 0;
  const endsAt = endsAtSec > 0 ? endsAtSec * 1000 : undefined;

  const viewers = parseViewers(raw.viewers);
  const embeddedStreams = buildStreamsFromRaw(raw, viewers);
  const sources = buildSourcesList(String(raw.id), embeddedStreams);

  const popular = alwaysLive
    ? viewers >= 15 || embeddedStreams.length >= 3
    : viewers >= 5 || embeddedStreams.length >= 2 || isMajorLeagueTag(raw.tag);

  const visuals = resolveMatchVisuals({
    title: raw.name,
    category: categoryId,
    league: raw.tag,
    alwaysLive,
    serverTeams: raw.resolved_teams,
    serverCountry: raw.resolved_country,
  });

  return {
    id: String(raw.id),
    uriName: raw.uri_name ?? raw.uri,
    title: raw.name,
    category: categoryId,
    categoryName,
    league: raw.tag,
    date: alwaysLive ? 0 : date,
    endsAt: alwaysLive ? undefined : endsAt,
    alwaysLive,
    poster: raw.poster,
    colors: raw.colors,
    locale: raw.locale,
    viewers,
    popular,
    countryCode: visuals.countryCode,
    countryName: visuals.countryName,
    teams: visuals.teams,
    sources,
    embeddedStreams,
  };
}

async function requestJson<T>(path: string, revalidate = 20): Promise<T> {
  const isServer = getMode() === "server";
  const response = await fetch(ppvApiUrl(path), {
    next: isServer ? { revalidate } : undefined,
    signal: AbortSignal.timeout(12000),
    headers: {
      accept: "application/json",
      ...(isServer ? { "user-agent": "PulseArena/1.0", referer: `${PPV_SITE_ORIGIN}/` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`PPV API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export const getPpvDirectory = cache(async (): Promise<PpvDirectory> => {
  const payload = await requestJson<PpvRawStreamsResponse>("/api/streams", 20);

  if (!payload || !Array.isArray(payload.streams)) {
    throw new Error("Invalid response payload from PPV.st API");
  }

  if (getMode() === "server") {
    try {
      const { enrichPpvGroupsOnServer } = await import("@/lib/ppv/team-enrichment");
      await enrichPpvGroupsOnServer(payload.streams);
    } catch {
      // Static catalog resolution remains active even if dynamic enrichment fails
    }
  }

  const sportsMap = new Map<string, SportCategory>();
  const matches: SportMatch[] = [];

  for (const group of payload.streams) {
    if (!group || !group.category) continue;
    const catId = slugifyCategory(group.category) || `cat-${group.id}`;
    if (!sportsMap.has(catId)) {
      sportsMap.set(catId, {
        id: catId,
        name: group.category,
        numericId: group.id,
        alwaysLive: Boolean(group.always_live),
      });
    }

    const rawItems = Array.isArray(group.streams) ? group.streams : [];
    for (const rawItem of rawItems) {
      if (!rawItem || !rawItem.id || !rawItem.name) continue;
      matches.push(normalizeRawStream(rawItem, group));
    }
  }

  return {
    sports: Array.from(sportsMap.values()),
    matches,
    timestamp: (payload.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
  };
});

export async function getSports(): Promise<SportCategory[]> {
  const dir = await getPpvDirectory();
  return dir.sports;
}

export async function getAllMatches(): Promise<SportMatch[]> {
  const dir = await getPpvDirectory();
  return dir.matches;
}

export async function getLiveMatches(now = Date.now()): Promise<SportMatch[]> {
  const matches = await getAllMatches();
  return matches.filter((match) => getMatchStatus(match, now) === "live");
}

export async function getTodayMatches(now = Date.now()): Promise<SportMatch[]> {
  const matches = await getAllMatches();
  const minWindow = now - 12 * 60 * 60 * 1000;
  const maxWindow = now + 30 * 60 * 60 * 1000;

  const filtered = matches.filter((match) => {
    if (match.alwaysLive) return true;
    const status = getMatchStatus(match, now);
    if (status === "live" || status === "recent") return true;
    return match.date >= minWindow && match.date <= maxWindow;
  });

  return filtered.length > 0 ? filtered : matches;
}

export async function getMatchesBySport(sport: string): Promise<SportMatch[]> {
  const normalized = slugifyCategory(sport);
  const matches = await getAllMatches();
  return matches.filter((match) => match.category === normalized || match.category === sport);
}

export async function getPopularMatchesBySport(sport: string): Promise<SportMatch[]> {
  const matches = await getMatchesBySport(sport);
  return matches.filter((match) => match.popular);
}

export const getMatchById = cache(async (id: string): Promise<SportMatch | undefined> => {
  const matches = await getAllMatches();
  return matches.find(
    (match) =>
      match.id === id ||
      match.uriName === id ||
      match.embeddedStreams?.some((stream) => stream.id === id)
  );
});

export async function getStreams(source: string, id: string): Promise<SportStream[]> {
  try {
    const detail = await requestJson<PpvRawStreamDetailResponse>(
      `/api/streams/${encodeURIComponent(id)}`,
      15
    );
    if (detail?.success && detail.data) {
      const streams = buildStreamsFromRaw(detail.data);
      if (streams.length > 0) {
        return reorderByPreferredSource(streams, source);
      }
    }
  } catch {
    // Fallback cleanly to embedded streams from /api/streams when detail endpoint is busy or a substream id was provided
  }

  const match = await getMatchById(id);
  if (match?.embeddedStreams && match.embeddedStreams.length > 0) {
    return reorderByPreferredSource(match.embeddedStreams, source);
  }
  return [];
}

function reorderByPreferredSource(streams: SportStream[], preferredSource: string): SportStream[] {
  if (!preferredSource) return streams;
  const cleanSource = preferredSource.toLowerCase().replace(/-sd$/, "");
  const hasMatch = streams.some(
    (s) => s.source === preferredSource || s.source === cleanSource
  );
  if (!hasMatch) return streams;

  const matching = streams.filter(
    (s) => s.source === preferredSource || s.source === cleanSource
  );
  const rest = streams.filter(
    (s) => s.source !== preferredSource && s.source !== cleanSource
  );
  return [...matching, ...rest].map((s, idx) => ({ ...s, streamNo: idx + 1 }));
}

export function ppvAssetUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${PPV_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function badgeImageUrl(badge?: string): string {
  if (!badge) return "";
  if (badge.startsWith("http://") || badge.startsWith("https://")) return badge;
  return "";
}

export function posterImageUrl(match: Pick<SportMatch, "poster">): string {
  if (!match.poster) return "";
  return ppvAssetUrl(match.poster);
}

