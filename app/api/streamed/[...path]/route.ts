import { STREAMED_ORIGIN } from "@/lib/streamed/client";

export const revalidate = 30;

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const upstreamPath = path.map((part) => encodeURIComponent(part).replace(/%2E/gi, ".").replace(/%2D/gi, "-").replace(/%5F/gi, "_")).join("/");
  const upstream = `${STREAMED_ORIGIN}/api/${upstreamPath}`;
  const response = await fetch(upstream, {
    next: { revalidate },
    headers: {
      accept: "application/json, image/webp;q=0.9, */*;q=0.8"
    }
  });

  const headers = new Headers(response.headers);
  headers.set("cache-control", "public, s-maxage=30, stale-while-revalidate=120");
  
  // Strip content encoding/length headers because Next/Node fetch decompresses the body automatically,
  // making the upstream compressed headers invalid for the returned decompressed body.
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
