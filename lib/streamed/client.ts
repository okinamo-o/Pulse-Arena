import type {
  StreamedEndpoint,
  StreamedMatch,
  StreamedMatchesResponse,
  StreamedSport,
  StreamedSportsResponse,
  StreamedStream,
  StreamedStreamsResponse
} from "@/lib/streamed/types";

export const STREAMED_ORIGIN = process.env.STREAMED_API_ORIGIN ?? "https://streamed.pk";

type FetchMode = "server" | "browser";

function trimApi(path: string) {
  return path.replace(/^\/?api\/?/, "").replace(/^\/+/, "");
}

function getMode(): FetchMode {
  return typeof window === "undefined" ? "server" : "browser";
}

export function streamedApiUrl(path: string, mode: FetchMode = getMode()) {
  const clean = trimApi(path);
  if (mode === "browser") {
    return `/api/streamed/${clean}`;
  }
  return `${STREAMED_ORIGIN}/api/${clean}`;
}

async function requestJson<T>(path: string, revalidate = 30): Promise<T> {
  const response = await fetch(streamedApiUrl(path), {
    next: getMode() === "server" ? { revalidate } : undefined,
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Streamed request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export const streamedEndpoints = {
  sports: "/api/sports",
  allMatches: "/api/matches/all",
  liveMatches: "/api/matches/live",
  todayMatches: "/api/matches/all-today",
  sportMatches: (sport: string) => `/api/matches/${encodeURIComponent(sport)}`,
  popularSportMatches: (sport: string) => `/api/matches/${encodeURIComponent(sport)}/popular`,
  streams: (source: string, id: string) =>
    `/api/stream/${encodeURIComponent(source)}/${encodeURIComponent(id)}`
} satisfies Record<string, StreamedEndpoint | ((...args: string[]) => StreamedEndpoint)>;

export async function getSports(): Promise<StreamedSport[]> {
  return requestJson<StreamedSportsResponse>(streamedEndpoints.sports, 3600);
}

export async function getAllMatches(): Promise<StreamedMatch[]> {
  return requestJson<StreamedMatchesResponse>(streamedEndpoints.allMatches, 60);
}

export async function getLiveMatches(): Promise<StreamedMatch[]> {
  return requestJson<StreamedMatchesResponse>(streamedEndpoints.liveMatches, 20);
}

export async function getTodayMatches(): Promise<StreamedMatch[]> {
  return requestJson<StreamedMatchesResponse>(streamedEndpoints.todayMatches, 60);
}

export async function getMatchesBySport(sport: string): Promise<StreamedMatch[]> {
  return requestJson<StreamedMatchesResponse>(streamedEndpoints.sportMatches(sport), 60);
}

export async function getPopularMatchesBySport(sport: string): Promise<StreamedMatch[]> {
  return requestJson<StreamedMatchesResponse>(streamedEndpoints.popularSportMatches(sport), 120);
}

export async function getStreams(source: string, id: string): Promise<StreamedStream[]> {
  return requestJson<StreamedStreamsResponse>(streamedEndpoints.streams(source, id), 20);
}

export async function getMatchById(id: string): Promise<StreamedMatch | undefined> {
  const [today, live, all] = await Promise.allSettled([getTodayMatches(), getLiveMatches(), getAllMatches()]);
  const pools = [today, live, all]
    .filter((result): result is PromiseFulfilledResult<StreamedMatch[]> => result.status === "fulfilled")
    .flatMap((result) => result.value);

  return pools.find((match) => match.id === id || match.sources.some((source) => source.id === id));
}

export function streamedAssetUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${STREAMED_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function badgeImageUrl(id?: string) {
  if (!id) return "";
  return `${STREAMED_ORIGIN}/api/images/badge/${encodeURIComponent(id)}.webp`;
}

export function posterImageUrl(match: Pick<StreamedMatch, "poster" | "teams">) {
  if (match.poster) return streamedAssetUrl(match.poster);
  const home = match.teams?.home?.badge;
  const away = match.teams?.away?.badge;
  if (home && away) {
    const encodedHome = encodeURIComponent(home);
    const encodedAway = encodeURIComponent(away);
    return `${STREAMED_ORIGIN}/api/images/poster/${encodedHome}/${encodedAway}.webp`;
  }
  return "";
}
