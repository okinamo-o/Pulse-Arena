import { NextResponse } from "next/server";

export interface FeedbackReport {
  id: string;
  message: string;
  timestamp: string;
  userAgent: string;
}

// Simple in-memory fallback for development without Upstash.
const localStore: FeedbackReport[] = [];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const report: FeedbackReport = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      const res = await fetch(`${redisUrl}/lpush/pulse-arena:feedback`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(JSON.stringify(report)), // Upstash requires JSON string as the arg
      });
      if (!res.ok) {
        console.error("Upstash Redis error", await res.text());
        throw new Error("Failed to save to database");
      }
    } else {
      console.warn("UPSTASH_REDIS_REST_URL not configured. Falling back to local memory.");
      localStore.unshift(report);
    }

    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error("Feedback API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  // We use this route for the admin page to fetch feedback
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const res = await fetch(`${redisUrl}/lrange/pulse-arena:feedback/0/-1`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      const data = await res.json();
      
      if (data.result && Array.isArray(data.result)) {
        const parsed = data.result.map((item: string) => {
          try {
            return JSON.parse(item);
          } catch {
            return { message: "Invalid JSON record", id: "error", timestamp: "", userAgent: "" };
          }
        });
        return NextResponse.json(parsed);
      }
      return NextResponse.json([]);
    } catch (err) {
      console.error(err);
      return NextResponse.json([]);
    }
  }

  // Fallback
  return NextResponse.json(localStore);
}
