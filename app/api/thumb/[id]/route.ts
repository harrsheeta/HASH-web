import type { NextRequest } from "next/server";

export const runtime = "nodejs";

// Proxies YouTube thumbnails so they can be used as same-origin
// canvas/WebGL textures without CORS taint.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) {
    return new Response("Invalid video id", { status: 400 });
  }

  try {
    const upstream = await fetch(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    if (!upstream.ok || !upstream.body) {
      return new Response("Thumbnail unavailable", { status: 404 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return new Response("Thumbnail unavailable", { status: 502 });
  }
}
