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

/* ── Basketball ── */
export interface BasketballStats {
  fieldGoalPct: { home: number; away: number };
  threePointPct: { home: number; away: number };
  freeThrowPct: { home: number; away: number };
  rebounds: { home: number; away: number };
  assists: { home: number; away: number };
  steals: { home: number; away: number };
  blocks: { home: number; away: number };
  turnovers: { home: number; away: number };
}

/* ── Tennis ── */
export interface TennisStats {
  aces: { home: number; away: number };
  doubleFaults: { home: number; away: number };
  firstServePct: { home: number; away: number };
  breakPointsWon: { home: number; away: number };
  winners: { home: number; away: number };
  unforcedErrors: { home: number; away: number };
}

/* ── Hockey ── */
export interface HockeyStats {
  shots: { home: number; away: number };
  powerPlayPct: { home: number; away: number };
  penaltyMinutes: { home: number; away: number };
  faceoffPct: { home: number; away: number };
  saves: { home: number; away: number };
  hits: { home: number; away: number };
}

/* ── Baseball ── */
export interface BaseballStats {
  runs: { home: number; away: number };
  hits: { home: number; away: number };
  errors: { home: number; away: number };
  homeRuns: { home: number; away: number };
  rbi: { home: number; away: number };
  battingAvg: { home: number; away: number };
}

/* ── Cricket ── */
export interface CricketStats {
  runs: { home: number; away: number };
  wickets: { home: number; away: number };
  overs: { home: number; away: number };
  runRate: { home: number; away: number };
  boundaries: { home: number; away: number };
  extras: { home: number; away: number };
}

/* ── American Football ── */
export interface AmericanFootballStats {
  totalYards: { home: number; away: number };
  passingYards: { home: number; away: number };
  rushingYards: { home: number; away: number };
  turnovers: { home: number; away: number };
  timeOfPossession: { home: string; away: string };
  firstDowns: { home: number; away: number };
  sacks: { home: number; away: number };
}

export type SportStats =
  | MatchStats
  | BasketballStats
  | TennisStats
  | HockeyStats
  | BaseballStats
  | CricketStats
  | AmericanFootballStats;

export type SportType = "football" | "basketball" | "tennis" | "hockey" | "baseball" | "cricket" | "american-football" | "unknown";

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

/** Period / Quarter / Set / Inning score breakdown */
export interface PeriodScore {
  label: string;   // "Q1", "Set 1", "1st", "Inn 1", etc.
  home: string;
  away: string;
}

export interface ComprehensiveMatchData {
  sportType: SportType;
  score?: {
    home: string;
    away: string;
    status: string;
  };
  /** Period-level breakdown (quarters, sets, innings, periods) */
  periods?: PeriodScore[];
  events: MatchEvent[];
  /** Football-specific stats (kept for backward compat) */
  stats?: MatchStats;
  /** Generic sport stats for non-football sports */
  sportStats?: SportStats;
  lineups?: {
    home: Lineup;
    away: Lineup;
  };
  standings?: StandingsRow[];
}

