/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComprehensiveMatchData, MatchEvent } from "@/lib/streamed/types";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 5; // Cache for 5 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home");
  const away = searchParams.get("away");

  if (!home || !away) {
    return Response.json({ error: "Missing home or away team parameters" }, { status: 400 });
  }

  try {
    // 1. Find the Match ID from ESPN Scoreboard
    const t = Math.floor(Date.now() / 5000);
    const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?_=${t}`;
    const scoreboardRes = await fetch(scoreboardUrl, { next: { revalidate: 5 } });
    if (!scoreboardRes.ok) throw new Error("Failed to fetch ESPN Scoreboard");
    const scoreboardData = await scoreboardRes.json();
    
    // We try to match either the home or away team name (case-insensitive substring match)
    const normalizedHome = home.toLowerCase();
    const normalizedAway = away.toLowerCase();
    
    let targetEvent = null;
    for (const event of scoreboardData.events) {
      const eventName = event.name.toLowerCase();
      if (eventName.includes(normalizedHome) || eventName.includes(normalizedAway)) {
        targetEvent = event;
        break;
      }
    }

    if (!targetEvent) {
      throw new Error("Match not found on ESPN");
    }

    const gameId = targetEvent.id;

    // 2. Fetch the Match Summary
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${gameId}&_=${t}`;
    const summaryRes = await fetch(summaryUrl, { next: { revalidate: 5 } });
    if (!summaryRes.ok) throw new Error("Failed to fetch ESPN Summary");
    const summaryData = await summaryRes.json();

    // 3. Map the data
    const mappedData: ComprehensiveMatchData = {
      score: {
        home: "0",
        away: "0",
        status: "AWAITING"
      },
      events: [],
      stats: {
        possession: { home: 50, away: 50 },
        shotsOnTarget: { home: 0, away: 0 },
        shotsOffTarget: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        yellowCards: { home: 0, away: 0 },
        redCards: { home: 0, away: 0 }
      },
      lineups: {
        home: { formation: "4-3-3", startingXI: [], substitutes: [] },
        away: { formation: "4-3-3", startingXI: [], substitutes: [] }
      },
      standings: []
    };

    // Parse Score and Status
    try {
      const comp = summaryData.header.competitions[0];
      const competitors = comp.competitors;
      const homeComp = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
      const awayComp = competitors.find((c: any) => c.homeAway === "away") || competitors[1];
      
      mappedData.score = {
        home: homeComp.score || "0",
        away: awayComp.score || "0",
        status: comp.status.type.shortDetail || comp.status.type.description || "LIVE"
      };
    } catch(e) {}

    // Parse Stats (Boxscore)
    try {
      const boxscore = summaryData.boxscore;
      if (boxscore && boxscore.teams) {
        const hStats = boxscore.teams[0]?.statistics || [];
        const aStats = boxscore.teams[1]?.statistics || [];

        const getStat = (stats: any[], name: string) => parseInt(stats.find((s: any) => s.name === name)?.displayValue || "0", 10);

        mappedData.stats = {
          possession: { home: getStat(hStats, "possessionPct"), away: getStat(aStats, "possessionPct") },
          shotsOnTarget: { home: getStat(hStats, "shotsOnTarget"), away: getStat(aStats, "shotsOnTarget") },
          shotsOffTarget: { home: getStat(hStats, "totalShots") - getStat(hStats, "shotsOnTarget"), away: getStat(aStats, "totalShots") - getStat(aStats, "shotsOnTarget") },
          corners: { home: getStat(hStats, "wonCorners"), away: getStat(aStats, "wonCorners") },
          fouls: { home: getStat(hStats, "foulsCommitted"), away: getStat(aStats, "foulsCommitted") },
          yellowCards: { home: getStat(hStats, "yellowCards"), away: getStat(aStats, "yellowCards") },
          redCards: { home: getStat(hStats, "redCards"), away: getStat(aStats, "redCards") }
        };
      }
    } catch (e) {}

    // Parse Lineups
    try {
      const rosters = summaryData.rosters;
      if (rosters && rosters.length >= 2) {
        const processRoster = (roster: any) => {
          const startingXI: any[] = [];
          const substitutes: any[] = [];
          (roster.roster || []).forEach((p: any) => {
            const player = {
              id: p.athlete.id,
              name: p.athlete.displayName,
              number: parseInt(p.jersey || "0", 10),
              position: p.position?.abbreviation || "UNK"
            };
            if (p.starter) startingXI.push(player);
            else substitutes.push(player);
          });
          return {
            formation: roster.formation || "4-3-3",
            startingXI,
            substitutes
          };
        };

        mappedData.lineups = {
          home: processRoster(rosters[0]),
          away: processRoster(rosters[1])
        };
      }
    } catch (e) {}

    // Parse Events
    try {
      const keyEvents = summaryData.keyEvents || [];
      mappedData.events = keyEvents.map((evt: any) => {
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
    } catch (e) {}

    // Parse Standings
    try {
      const standings = summaryData.standings?.groups?.[0]?.standings?.entries || [];
      const state = summaryData.header?.competitions?.[0]?.status?.type?.state;
      const isLive = state === "in";
      const hScoreInt = parseInt(mappedData.score?.home || "0", 10);
      const aScoreInt = parseInt(mappedData.score?.away || "0", 10);

      const comps = summaryData.header?.competitions?.[0]?.competitors || [];
      const espnHome = comps.find((c: any) => c.homeAway === "home")?.team?.displayName;
      const espnAway = comps.find((c: any) => c.homeAway === "away")?.team?.displayName;

      if (standings.length > 0) {
        const parsedStandings = standings.map((entry: any) => {
          const stats = entry.stats || [];
          const getS = (name: string) => parseInt(stats.find((s: any) => s.name === name)?.displayValue || "0", 10);
          let won = getS("wins");
          let drawn = getS("ties");
          let lost = getS("losses");
          let played = getS("gamesPlayed");
          let goalsFor = getS("pointsFor");
          let goalsAgainst = getS("pointsAgainst");
          let goalDiffInt = getS("pointDifferential");
          
          const teamName = typeof entry.team === "string" ? entry.team : (entry.team?.displayName || "Unknown");

          // Look across ALL events in the scoreboard to see if this specific team is currently playing a LIVE match
          const activeEvent = scoreboardData?.events?.find((evt: any) => {
            if (evt.status?.type?.state !== "in") return false;
            const hName = evt.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "home")?.team?.displayName;
            const aName = evt.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "away")?.team?.displayName;
            return (hName && teamName === hName) || (aName && teamName === aName) || (hName && teamName.includes(hName)) || (aName && teamName.includes(aName));
          });

          if (activeEvent) {
            const hComp = activeEvent.competitions[0].competitors.find((c: any) => c.homeAway === "home");
            const aComp = activeEvent.competitions[0].competitors.find((c: any) => c.homeAway === "away");
            const hScore = parseInt(hComp?.score || "0", 10);
            const aScore = parseInt(aComp?.score || "0", 10);
            const isHomeTeam = teamName === hComp?.team?.displayName || (hComp?.team?.displayName && teamName.includes(hComp.team.displayName));

            if (isHomeTeam) {
              played++;
              goalsFor += hScore;
              goalsAgainst += aScore;
              goalDiffInt += (hScore - aScore);
              if (hScore > aScore) won++;
              else if (hScore === aScore) drawn++;
              else lost++;
            } else {
              played++;
              goalsFor += aScore;
              goalsAgainst += hScore;
              goalDiffInt += (aScore - hScore);
              if (aScore > hScore) won++;
              else if (aScore === hScore) drawn++;
              else lost++;
            }
          }

          return {
            team: teamName,
            played,
            won,
            drawn,
            lost,
            goalsFor,
            goalsAgainst,
            goalDifference: goalDiffInt > 0 ? `+${goalDiffInt}` : goalDiffInt.toString(),
            points: won * 3 + drawn,
            form: []
          };
        });

        // Re-sort standings by points
        parsedStandings.sort((a: any, b: any) => {
          if (b.points !== a.points) return b.points - a.points;
          const gdA = parseInt(a.goalDifference.replace("+", ""), 10);
          const gdB = parseInt(b.goalDifference.replace("+", ""), 10);
          if (gdB !== gdA) return gdB - gdA;
          return b.goalsFor - a.goalsFor;
        });

        mappedData.standings = parsedStandings.map((s: any, i: number) => ({ ...s, position: i + 1 }));
      } else {
        mappedData.standings = undefined;
      }
    } catch (e) {}

    return Response.json(mappedData, {
      headers: { "cache-control": "public, s-maxage=5, stale-while-revalidate=10" }
    });

  } catch (error) {
    Sentry.captureException(error);
    
    const emptyData: ComprehensiveMatchData = {
      score: undefined,
      events: [],
      stats: undefined,
      lineups: undefined,
      standings: undefined
    };

    return Response.json(emptyData, {
      headers: { "cache-control": "public, s-maxage=5, stale-while-revalidate=10" }
    });
  }
}
