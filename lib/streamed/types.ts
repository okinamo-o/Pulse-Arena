export interface StreamedSport {
  id: string;
  name: string;
}

export interface StreamedTeam {
  name: string;
  badge?: string;
}

export interface StreamedMatchTeams {
  home?: StreamedTeam;
  away?: StreamedTeam;
}

export interface StreamedMatchSource {
  source: string;
  id: string;
}

export interface StreamedMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: StreamedMatchTeams;
  sources: StreamedMatchSource[];
}

export interface StreamedStream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
  viewers?: number;
}

export type StreamedSportsResponse = StreamedSport[];
export type StreamedMatchesResponse = StreamedMatch[];
export type StreamedStreamsResponse = StreamedStream[];

export type StreamedEndpoint =
  | "/api/sports"
  | "/api/matches/all"
  | "/api/matches/live"
  | "/api/matches/all-today"
  | `/api/matches/${string}`
  | `/api/matches/${string}/popular`
  | `/api/stream/${string}/${string}`
  | `/api/images/badge/${string}.webp`
  | `/api/images/poster/${string}/${string}.webp`;

export interface NormalizedMatch extends StreamedMatch {
  heatScore: number;
  status: MatchStatus;
  startsInMs: number;
}

export type MatchStatus = "live" | "upcoming" | "recent" | "ended";

export interface MatchInsight {
  label: string;
  value: string;
  tone: "lime" | "orange" | "cyan" | "muted";
}
