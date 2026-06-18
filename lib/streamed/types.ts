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

export interface MatchEvent {
  id: string;
  minute: string; // e.g., "83'"
  type: 'goal' | 'yellow_card' | 'red_card' | 'sub';
  team: 'home' | 'away';
  primaryPlayer: string;
  secondaryPlayer?: string;
  score?: string; // e.g., "1 - 1"
}

export interface MatchStats {
  possession: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  shotsOffTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position?: string;
}

export interface Lineup {
  formation: string;
  startingXI: Player[];
  substitutes: Player[];
}

export interface StandingsRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: string;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface ComprehensiveMatchData {
  score?: {
    home: string;
    away: string;
    status: string;
  };
  events: MatchEvent[];
  stats?: MatchStats;
  lineups?: {
    home: Lineup;
    away: Lineup;
  };
  standings?: StandingsRow[];
}
