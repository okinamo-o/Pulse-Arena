import { PPV_ORIGIN, PPV_SITE_ORIGIN } from "@/lib/ppv/client";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 20;

const ALLOWED_ROOT = "streams";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!path || path.length === 0 || path.length > 5) {
    return Response.json({ error: "Invalid API path" }, { status: 400 });
  }

  if (path[0] !== ALLOWED_ROOT) {
    return Response.json({ error: "Endpoint not allowed" }, { status: 404 });
  }

  const upstreamPath = path
    .map((part) => encodeURIComponent(part).replace(/%2E/gi, ".").replace(/%2D/gi, "-").replace(/%5F/gi, "_"))
    .join("/");

  const upstream = `${PPV_ORIGIN}/api/${upstreamPath}`;

  try {
    const response = await fetch(upstream, {
      next: { revalidate },
      signal: AbortSignal.timeout(15000),
      headers: {
        accept: "application/json",
        "user-agent": "PulseArena/1.0",
        referer: `${PPV_SITE_ORIGIN}/`,
      },
    });

    if (response.status === 404) {
      return Response.json(
        { success: false, error: "Stream not found" },
        { status: 404, headers: { "cache-control": "public, s-maxage=10" } }
      );
    }

    if (!response.ok) {
      Sentry.captureException(new Error(`PPV upstream returned ${response.status}`));
      return Response.json(
        { error: "Upstream API Error", code: response.status },
        { status: 502, headers: { "cache-control": "no-store" } }
      );
    }

    const text = await response.text();
    let data: unknown;
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
        "cache-control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    Sentry.captureException(err);
    return Response.json(
      { error: "Upstream Connection Failed", code: 503 },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}

