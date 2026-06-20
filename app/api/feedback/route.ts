import { NextResponse } from "next/server";
import { FeedbackReport, getLocalStore, saveLocalStore } from "@/lib/feedback-store";

// Re-export type so we don't break other files referencing it
export type { FeedbackReport };

export async function POST(req: Request) {
  try {
    const { message, category = "other" } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const report: FeedbackReport = {
      id: crypto.randomUUID(),
      category,
      status: "new",
      message,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      const res = await fetch(`${redisUrl}/hset/pulse-arena:feedback/${report.id}`, {
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
      console.warn("UPSTASH_REDIS_REST_URL not configured. Falling back to local file.");
      const store = getLocalStore();
      store.set(report.id, report);
      saveLocalStore(store);
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
      const res = await fetch(`${redisUrl}/hvals/pulse-arena:feedback`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: "no-store"
      });
      const data = await res.json();
      
      if (data.result && Array.isArray(data.result)) {
        const parsed = data.result.map((item: string) => {
          try {
            return JSON.parse(item);
          } catch {
            return { message: "Invalid JSON record", id: "error", timestamp: "", userAgent: "", category: "other", status: "new" };
          }
        });
        
        // Sort newest first
        parsed.sort((a: FeedbackReport, b: FeedbackReport) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return NextResponse.json(parsed);
      }
      return NextResponse.json([]);
    } catch (err) {
      console.error(err);
      return NextResponse.json([]);
    }
  }

  // Fallback
  const store = getLocalStore();
  const parsed = Array.from(store.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json(parsed);
}

