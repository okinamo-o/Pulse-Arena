import { STREAMED_ORIGIN } from "@/lib/streamed/client";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (path.length > 5) {
    return Response.json({ error: "Path too deep" }, { status: 400 });
  }

  const upstreamPath = path.map((part) => encodeURIComponent(part).replace(/%2E/gi, ".").replace(/%2D/gi, "-").replace(/%5F/gi, "_")).join("/");
  
  const upstream = `${STREAMED_ORIGIN}/api/${upstreamPath}`;
  
  try {
    const response = await fetch(upstream, {
      next: { revalidate },
      signal: AbortSignal.timeout(15000),
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      Sentry.captureException(new Error(`Upstream returned ${response.status}`));
      return Response.json(
        { error: "Upstream API Error", code: response.status },
        { status: 502, headers: { "cache-control": "no-store" } }
      );
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      Sentry.captureException(err);
      return Response.json(
        { error: "Upstream returned invalid JSON", code: "INVALID_JSON" },
        { status: 502, headers: { "cache-control": "no-store" } }
      );
    }

    return Response.json(data, {
      headers: {
        "cache-control": "public, s-maxage=30, stale-while-revalidate=120"
      }
    });
  } catch (err) {
    Sentry.captureException(err);
    return Response.json(
      { error: "Upstream Connection Failed", code: 503 },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
