 
import * as Sentry from "@sentry/nextjs";
import { resolveSportType, findMatchOnEspn, fetchEspnSummary } from "@/lib/stats/espn-config";
import {
  parseSoccer,
  parseBasketball,
  parseTennis,
  parseHockey,
  parseBaseball,
  parseCricket,
  parseAmericanFootball,
} from "@/lib/stats/sport-parsers";

export const dynamic = "force-dynamic";
export const revalidate = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get("home");
  const away = searchParams.get("away");
  const category = searchParams.get("category")?.toLowerCase() || "football";

  if (!home || !away) {
    return Response.json({ error: "Missing home or away team parameters" }, { status: 400 });
  }

  const sportType = resolveSportType(category);

  if (sportType === "unknown") {
    return Response.json(
      { status: "unsupported", sportType: "unknown", reason: `Telemetry is not available for "${category}"` },
      { status: 200, headers: { "cache-control": "public, s-maxage=300" } }
    );
  }

  try {
    // 1. Find the match across ESPN scoreboards
    const found = await findMatchOnEspn(home, away, sportType);
    if (!found) throw new Error("Match not found on ESPN");

    const { targetEvent, scoreboardData, sportPath } = found;
    const gameId = targetEvent.id;

    // 2. Fetch summary
    const summaryData = await fetchEspnSummary(gameId, sportPath);

    // 3. Parse based on sport type
    let mappedData;
    switch (sportType) {
      case "football":
        mappedData = parseSoccer(summaryData, scoreboardData);
        break;
      case "basketball":
        mappedData = parseBasketball(summaryData);
        break;
      case "tennis":
        mappedData = parseTennis(summaryData);
        break;
      case "hockey":
        mappedData = parseHockey(summaryData);
        break;
      case "baseball":
        mappedData = parseBaseball(summaryData);
        break;
      case "cricket":
        mappedData = parseCricket(summaryData);
        break;
      case "american-football":
        mappedData = parseAmericanFootball(summaryData);
        break;
      default:
        mappedData = parseSoccer(summaryData, scoreboardData);
    }

    return Response.json(mappedData, {
      headers: { "cache-control": "public, s-maxage=5, stale-while-revalidate=10" },
    });
  } catch (error) {
    const isNotFound = error instanceof Error && error.message === "Match not found on ESPN";

    if (!isNotFound) {
      Sentry.captureException(error);
    }

    return Response.json(
      { status: isNotFound ? "not_found" : "error", reason: error instanceof Error ? error.message : "Unknown error" },
      {
        status: isNotFound ? 404 : 503,
        headers: { "cache-control": isNotFound ? "public, s-maxage=60" : "no-store" },
      }
    );
  }
}
