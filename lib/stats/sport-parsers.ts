/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ComprehensiveMatchData,
  MatchEvent,
  BasketballStats,
  TennisStats,
  HockeyStats,
  BaseballStats,
  CricketStats,
  AmericanFootballStats,
  PeriodScore,
  SportType,
} from "@/lib/streamed/types";

// ─── Shared helpers ──────────────────────────────────────────
function getStat(stats: any[], name: string, fallback = "0"): number {
  return parseFloat(stats.find((s: any) => s.name === name)?.displayValue || fallback);
}

function getStatStr(stats: any[], name: string, fallback = "0"): string {
  return stats.find((s: any) => s.name === name)?.displayValue || fallback;
}

function parseScore(summaryData: any): { home: string; away: string; status: string } {
  try {
    const comp = summaryData.header.competitions[0];
    const competitors = comp.competitors;
    const homeComp = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
    const awayComp = competitors.find((c: any) => c.homeAway === "away") || competitors[1];
    return {
      home: homeComp.score || "0",
      away: awayComp.score || "0",
      status: comp.status.type.shortDetail || comp.status.type.description || "LIVE",
    };
  } catch {
    return { home: "0", away: "0", status: "AWAITING" };
  }
}

function parseLineups(summaryData: any) {
  try {
    const rosters = summaryData.rosters;
    if (!rosters || rosters.length < 2) return undefined;
    const processRoster = (roster: any) => {
      const startingXI: any[] = [];
      const substitutes: any[] = [];
      (roster.roster || []).forEach((p: any) => {
        const player = {
          id: p.athlete?.id || String(Math.random()),
          name: p.athlete?.displayName || "Unknown",
          number: parseInt(p.jersey || "0", 10),
          position: p.position?.abbreviation || "UNK",
        };
        if (p.starter) startingXI.push(player);
        else substitutes.push(player);
      });
      return { formation: roster.formation || "", startingXI, substitutes };
    };
    return { home: processRoster(rosters[0]), away: processRoster(rosters[1]) };
  } catch {
    return undefined;
  }
}

function parsePeriods(summaryData: any, labels: string[]): PeriodScore[] {
  try {
    const comp = summaryData.header.competitions[0];
    const homeComp = comp.competitors.find((c: any) => c.homeAway === "home") || comp.competitors[0];
    const awayComp = comp.competitors.find((c: any) => c.homeAway === "away") || comp.competitors[1];
    const homeLinescores = homeComp.linescores || [];
    const awayLinescores = awayComp.linescores || [];
    const periods: PeriodScore[] = [];
    const count = Math.max(homeLinescores.length, awayLinescores.length);
    for (let i = 0; i < count; i++) {
      periods.push({
        label: labels[i] || `P${i + 1}`,
        home: homeLinescores[i]?.displayValue || homeLinescores[i]?.value?.toString() || "-",
        away: awayLinescores[i]?.displayValue || awayLinescores[i]?.value?.toString() || "-",
      });
    }
    return periods;
  } catch {
    return [];
  }
}

// ─── Football / Soccer ───────────────────────────────────────
export function parseSoccer(summaryData: any, scoreboardData: any): ComprehensiveMatchData {
  const data: ComprehensiveMatchData = {
    sportType: "football",
    score: parseScore(summaryData),
    events: [],
    stats: {
      possession: { home: 50, away: 50 },
      shotsOnTarget: { home: 0, away: 0 },
      shotsOffTarget: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 },
    },
    lineups: parseLineups(summaryData),
    standings: [],
  };

  // Stats
  try {
    const boxscore = summaryData.boxscore;
    if (boxscore?.teams) {
      const hStats = boxscore.teams[0]?.statistics || [];
      const aStats = boxscore.teams[1]?.statistics || [];
      data.stats = {
        possession: { home: getStat(hStats, "possessionPct"), away: getStat(aStats, "possessionPct") },
        shotsOnTarget: { home: getStat(hStats, "shotsOnTarget"), away: getStat(aStats, "shotsOnTarget") },
        shotsOffTarget: {
          home: getStat(hStats, "totalShots") - getStat(hStats, "shotsOnTarget"),
          away: getStat(aStats, "totalShots") - getStat(aStats, "shotsOnTarget"),
        },
        corners: { home: getStat(hStats, "wonCorners"), away: getStat(aStats, "wonCorners") },
        fouls: { home: getStat(hStats, "foulsCommitted"), away: getStat(aStats, "foulsCommitted") },
        yellowCards: { home: getStat(hStats, "yellowCards"), away: getStat(aStats, "yellowCards") },
        redCards: { home: getStat(hStats, "redCards"), away: getStat(aStats, "redCards") },
      };
    }
  } catch {}

  // Events
  try {
    const keyEvents = summaryData.keyEvents || [];
    data.events = keyEvents.map((evt: any) => {
      let type: MatchEvent["type"] = "goal";
      if (evt.type?.text?.toLowerCase().includes("yellow")) type = "yellow_card";
      if (evt.type?.text?.toLowerCase().includes("red")) type = "red_card";
      if (evt.type?.text?.toLowerCase().includes("substitution")) type = "sub";
      return {
        id: evt.id,
        minute: evt.clock?.displayValue || "0'",
        type,
        team: evt.team?.homeAway === "home" ? "home" : "away",
        primaryPlayer: evt.participants?.[0]?.athlete?.displayName || "Unknown",
        secondaryPlayer: evt.participants?.[1]?.athlete?.displayName,
      };
    });
  } catch {}

  // Standings
  try {
    const standings = summaryData.standings?.groups?.[0]?.standings?.entries || [];
    if (standings.length > 0) {
      const parsed = standings.map((entry: any) => {
        const stats = entry.stats || [];
        const getS = (name: string) => getStat(stats, name);
        const teamName = typeof entry.team === "string" ? entry.team : (entry.team?.displayName || "Unknown");
        const won = getS("wins");
        const drawn = getS("ties");
        const lost = getS("losses");
        const played = getS("gamesPlayed");
        const goalsFor = getS("pointsFor");
        const goalsAgainst = getS("pointsAgainst");
        const goalDiffInt = getS("pointDifferential");
        return {
          team: teamName, played, won, drawn, lost, goalsFor, goalsAgainst,
          goalDifference: goalDiffInt > 0 ? `+${goalDiffInt}` : goalDiffInt.toString(),
          points: won * 3 + drawn,
          form: [] as ("W" | "D" | "L")[],
        };
      });
      parsed.sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalsFor - a.goalsFor;
      });
      data.standings = parsed.map((s: any, i: number) => ({ ...s, position: i + 1 }));
    }
  } catch {}

  return data;
}

// ─── Basketball ──────────────────────────────────────────────
export function parseBasketball(summaryData: any): ComprehensiveMatchData {
  const score = parseScore(summaryData);
  const periods = parsePeriods(summaryData, ["Q1", "Q2", "Q3", "Q4", "OT", "2OT", "3OT"]);

  let sportStats: BasketballStats | undefined;
  try {
    const boxscore = summaryData.boxscore;
    if (boxscore?.teams) {
      const hStats = boxscore.teams[0]?.statistics || [];
      const aStats = boxscore.teams[1]?.statistics || [];
      sportStats = {
        fieldGoalPct: { home: getStat(hStats, "fieldGoalPct"), away: getStat(aStats, "fieldGoalPct") },
        threePointPct: { home: getStat(hStats, "threePointFieldGoalPct"), away: getStat(aStats, "threePointFieldGoalPct") },
        freeThrowPct: { home: getStat(hStats, "freeThrowPct"), away: getStat(aStats, "freeThrowPct") },
        rebounds: { home: getStat(hStats, "totalRebounds"), away: getStat(aStats, "totalRebounds") },
        assists: { home: getStat(hStats, "assists"), away: getStat(aStats, "assists") },
        steals: { home: getStat(hStats, "steals"), away: getStat(aStats, "steals") },
        blocks: { home: getStat(hStats, "blocks"), away: getStat(aStats, "blocks") },
        turnovers: { home: getStat(hStats, "turnovers"), away: getStat(aStats, "turnovers") },
      };
    }
  } catch {}

  // Standings
  let standings;
  try {
    const entries = summaryData.standings?.groups?.[0]?.standings?.entries || [];
    if (entries.length > 0) {
      const parsed = entries.map((entry: any) => {
        const stats = entry.stats || [];
        const teamName = typeof entry.team === "string" ? entry.team : (entry.team?.displayName || "Unknown");
        const won = getStat(stats, "wins");
        const lost = getStat(stats, "losses");
        return {
          team: teamName, position: 0, played: won + lost, won, drawn: 0, lost,
          goalsFor: 0, goalsAgainst: 0, goalDifference: "0",
          points: won,
          form: [] as ("W" | "D" | "L")[],
        };
      });
      parsed.sort((a: any, b: any) => b.won - a.won);
      standings = parsed.map((s: any, i: number) => ({ ...s, position: i + 1 }));
    }
  } catch {}

  return {
    sportType: "basketball",
    score,
    periods,
    events: [],
    sportStats,
    lineups: parseLineups(summaryData),
    standings,
  };
}

// ─── Tennis ──────────────────────────────────────────────────
export function parseTennis(summaryData: any): ComprehensiveMatchData {
  const score = parseScore(summaryData);
  const periods = parsePeriods(summaryData, ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5"]);

  let sportStats: TennisStats | undefined;
  try {
    const boxscore = summaryData.boxscore;
    if (boxscore?.players && boxscore.players.length >= 2) {
      const p1Stats = boxscore.players[0]?.statistics?.[0]?.stats || [];
      const p2Stats = boxscore.players[1]?.statistics?.[0]?.stats || [];
      // Tennis stats often come differently — try common approaches
      const getP = (stats: any[], idx: number) => parseFloat(stats[idx] || "0");
      sportStats = {
        aces: { home: getP(p1Stats, 0), away: getP(p2Stats, 0) },
        doubleFaults: { home: getP(p1Stats, 1), away: getP(p2Stats, 1) },
        firstServePct: { home: getP(p1Stats, 2), away: getP(p2Stats, 2) },
        breakPointsWon: { home: getP(p1Stats, 3), away: getP(p2Stats, 3) },
        winners: { home: getP(p1Stats, 4), away: getP(p2Stats, 4) },
        unforcedErrors: { home: getP(p1Stats, 5), away: getP(p2Stats, 5) },
      };
    }
  } catch {}

  return {
    sportType: "tennis",
    score,
    periods,
    events: [],
    sportStats,
  };
}

// ─── Hockey ──────────────────────────────────────────────────
export function parseHockey(summaryData: any): ComprehensiveMatchData {
  const score = parseScore(summaryData);
  const periods = parsePeriods(summaryData, ["1st", "2nd", "3rd", "OT", "SO"]);

  let sportStats: HockeyStats | undefined;
  try {
    const boxscore = summaryData.boxscore;
    if (boxscore?.teams) {
      const hStats = boxscore.teams[0]?.statistics || [];
      const aStats = boxscore.teams[1]?.statistics || [];
      sportStats = {
        shots: { home: getStat(hStats, "blockedShots") + getStat(hStats, "shotsOnGoal"), away: getStat(aStats, "blockedShots") + getStat(aStats, "shotsOnGoal") },
        powerPlayPct: { home: getStat(hStats, "powerPlayPct"), away: getStat(aStats, "powerPlayPct") },
        penaltyMinutes: { home: getStat(hStats, "penaltyMinutes"), away: getStat(aStats, "penaltyMinutes") },
        faceoffPct: { home: getStat(hStats, "faceoffPct"), away: getStat(aStats, "faceoffPct") },
        saves: { home: getStat(hStats, "saves"), away: getStat(aStats, "saves") },
        hits: { home: getStat(hStats, "hits"), away: getStat(aStats, "hits") },
      };
    }
  } catch {}

  let standings;
  try {
    const entries = summaryData.standings?.groups?.[0]?.standings?.entries || [];
    if (entries.length > 0) {
      const parsed = entries.map((entry: any) => {
        const stats = entry.stats || [];
        const teamName = typeof entry.team === "string" ? entry.team : (entry.team?.displayName || "Unknown");
        const won = getStat(stats, "wins");
        const lost = getStat(stats, "losses");
        const otLosses = getStat(stats, "otLosses");
        const pts = getStat(stats, "points");
        return {
          team: teamName, position: 0, played: won + lost + otLosses, won, drawn: 0, lost,
          goalsFor: getStat(stats, "pointsFor"), goalsAgainst: getStat(stats, "pointsAgainst"),
          goalDifference: "0", points: pts,
          form: [] as ("W" | "D" | "L")[],
        };
      });
      parsed.sort((a: any, b: any) => b.points - a.points);
      standings = parsed.map((s: any, i: number) => ({ ...s, position: i + 1 }));
    }
  } catch {}

  return {
    sportType: "hockey",
    score,
    periods,
    events: [],
    sportStats,
    lineups: parseLineups(summaryData),
    standings,
  };
}

// ─── Baseball ────────────────────────────────────────────────
export function parseBaseball(summaryData: any): ComprehensiveMatchData {
  const score = parseScore(summaryData);
  const inningLabels = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
  const periods = parsePeriods(summaryData, inningLabels);

  let sportStats: BaseballStats | undefined;
  try {
    const boxscore = summaryData.boxscore;
    if (boxscore?.teams) {
      const hStats = boxscore.teams[0]?.statistics || [];
      const aStats = boxscore.teams[1]?.statistics || [];
      sportStats = {
        runs: { home: getStat(hStats, "runs"), away: getStat(aStats, "runs") },
        hits: { home: getStat(hStats, "hits"), away: getStat(aStats, "hits") },
        errors: { home: getStat(hStats, "errors"), away: getStat(aStats, "errors") },
        homeRuns: { home: getStat(hStats, "homeRuns"), away: getStat(aStats, "homeRuns") },
        rbi: { home: getStat(hStats, "RBIs"), away: getStat(aStats, "RBIs") },
        battingAvg: { home: getStat(hStats, "avg"), away: getStat(aStats, "avg") },
      };
    }
  } catch {}

  return {
    sportType: "baseball",
    score,
    periods,
    events: [],
    sportStats,
    lineups: parseLineups(summaryData),
  };
}

// ─── Cricket ─────────────────────────────────────────────────
export function parseCricket(summaryData: any): ComprehensiveMatchData {
  const score = parseScore(summaryData);
  const periods = parsePeriods(summaryData, ["1st Inn", "2nd Inn", "3rd Inn", "4th Inn"]);

  let sportStats: CricketStats | undefined;
  try {
    const boxscore = summaryData.boxscore;
    if (boxscore?.teams) {
      const hStats = boxscore.teams[0]?.statistics || [];
      const aStats = boxscore.teams[1]?.statistics || [];
      sportStats = {
        runs: { home: getStat(hStats, "runs"), away: getStat(aStats, "runs") },
        wickets: { home: getStat(hStats, "wickets"), away: getStat(aStats, "wickets") },
        overs: { home: getStat(hStats, "overs"), away: getStat(aStats, "overs") },
        runRate: { home: getStat(hStats, "runRate"), away: getStat(aStats, "runRate") },
        boundaries: { home: getStat(hStats, "fours") + getStat(hStats, "sixes"), away: getStat(aStats, "fours") + getStat(aStats, "sixes") },
        extras: { home: getStat(hStats, "extras"), away: getStat(aStats, "extras") },
      };
    }
  } catch {}

  return {
    sportType: "cricket",
    score,
    periods,
    events: [],
    sportStats,
    lineups: parseLineups(summaryData),
  };
}

// ─── American Football ───────────────────────────────────────
export function parseAmericanFootball(summaryData: any): ComprehensiveMatchData {
  const score = parseScore(summaryData);
  const periods = parsePeriods(summaryData, ["Q1", "Q2", "Q3", "Q4", "OT"]);

  let sportStats: AmericanFootballStats | undefined;
  try {
    const boxscore = summaryData.boxscore;
    if (boxscore?.teams) {
      const hStats = boxscore.teams[0]?.statistics || [];
      const aStats = boxscore.teams[1]?.statistics || [];
      sportStats = {
        totalYards: { home: getStat(hStats, "totalYards"), away: getStat(aStats, "totalYards") },
        passingYards: { home: getStat(hStats, "netPassingYards"), away: getStat(aStats, "netPassingYards") },
        rushingYards: { home: getStat(hStats, "rushingYards"), away: getStat(aStats, "rushingYards") },
        turnovers: { home: getStat(hStats, "turnovers"), away: getStat(aStats, "turnovers") },
        timeOfPossession: { home: getStatStr(hStats, "possessionTime", "0:00"), away: getStatStr(aStats, "possessionTime", "0:00") },
        firstDowns: { home: getStat(hStats, "firstDowns"), away: getStat(aStats, "firstDowns") },
        sacks: { home: getStat(hStats, "sacks"), away: getStat(aStats, "sacks") },
      };
    }
  } catch {}

  let standings;
  try {
    const entries = summaryData.standings?.groups?.[0]?.standings?.entries || [];
    if (entries.length > 0) {
      const parsed = entries.map((entry: any) => {
        const stats = entry.stats || [];
        const teamName = typeof entry.team === "string" ? entry.team : (entry.team?.displayName || "Unknown");
        const won = getStat(stats, "wins");
        const lost = getStat(stats, "losses");
        return {
          team: teamName, position: 0, played: won + lost, won, drawn: 0, lost,
          goalsFor: getStat(stats, "pointsFor"), goalsAgainst: getStat(stats, "pointsAgainst"),
          goalDifference: "0", points: won,
          form: [] as ("W" | "D" | "L")[],
        };
      });
      parsed.sort((a: any, b: any) => b.won - a.won);
      standings = parsed.map((s: any, i: number) => ({ ...s, position: i + 1 }));
    }
  } catch {}

  return {
    sportType: "american-football",
    score,
    periods,
    events: [],
    sportStats,
    lineups: parseLineups(summaryData),
    standings,
  };
}
