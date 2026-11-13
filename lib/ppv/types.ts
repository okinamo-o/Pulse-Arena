export interface SportCategory {
  id: string;
  name: string;
  numericId?: number;
  alwaysLive?: boolean;
}

export interface SportTeam {
  name: string;
  badge?: string;
}

export interface SportMatchTeams {
  home?: SportTeam;
  away?: SportTeam;
}

export interface SportMatchSource {
  source: string;
  id: string;
  label?: string;
}

export interface SportStream {
  id: string;
  streamNo: number;
  language: string;
  label?: string;
  hd: boolean;
  embedUrl: string;
  source: string;
  viewers?: number;
}

export interface SportMatch {
  id: string;
  uriName?: string;
  title: string;
  category: string;
  categoryName?: string;
  league?: string;
  date: number;
  endsAt?: number;
  alwaysLive?: boolean;
  poster?: string;
  colors?: [string, string];
  locale?: string;
  viewers?: number;
  popular: boolean;
  teams?: SportMatchTeams;
  sources: SportMatchSource[];
  embeddedStreams?: SportStream[];
}

export interface PpvDirectory {
  sports: SportCategory[];
  matches: SportMatch[];
  timestamp: number;
}

export interface NormalizedMatch extends SportMatch {
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
  type: "goal" | "yellow_card" | "red_card" | "sub";
  team: "home" | "away";
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

export type SportType =
  | "football"
  | "basketball"
  | "tennis"
  | "hockey"
  | "baseball"
  | "cricket"
  | "american-football"
  | "unknown";

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
  form: ("W" | "D" | "L")[];
}

/** Period / Quarter / Set / Inning score breakdown */
export interface PeriodScore {
  label: string;
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
  periods?: PeriodScore[];
  events: MatchEvent[];
  stats?: MatchStats;
  sportStats?: SportStats;
  lineups?: {
    home: Lineup;
    away: Lineup;
  };
  standings?: StandingsRow[];
}

/* ── Raw PPV.st Upstream API Types ── */
export interface PpvRawSubstream {
  id: number | string;
  name?: string;
  tag?: string;
  uri_name?: string;
  uri?: string;
  source_tag?: string;
  source_tag_raw?: string;
  locale?: string;
  iframe?: string;
  sources?: PpvRawDetailSource[];
}

export interface PpvRawDetailSource {
  name?: string;
  default?: boolean;
  type?: string;
  data?: string;
}

export interface PpvRawStream {
  id: number | string;
  name: string;
  tag?: string;
  source_tag?: string;
  source_tag_raw?: string;
  poster?: string;
  blurhash?: string;
  colors?: [string, string];
  uri_name?: string;
  uri?: string;
  starts_at?: number;
  ends_at?: number;
  start_timestamp?: number;
  end_timestamp?: number;
  always_live?: number | boolean;
  locale?: string;
  category_name?: string;
  category?: number | string;
  iframe?: string;
  substreams?: PpvRawSubstream[];
  sources?: PpvRawDetailSource[];
  viewers?: string | number;
}

export interface PpvRawCategoryGroup {
  category: string;
  id: number;
  always_live?: boolean | number;
  streams: PpvRawStream[];
}

export interface PpvRawStreamsResponse {
  success?: boolean;
  timestamp?: number;
  streams?: PpvRawCategoryGroup[];
}

export interface PpvRawStreamDetailResponse {
  success?: boolean;
  data?: PpvRawStream;
  error?: string;
}

