import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getEmbedUrl } from "@/lib/video";

type EpisodeBody = { title?: unknown; videoUrl?: unknown; duration?: unknown; published?: unknown };

/** Salva a lista inteira de episódios de uma vez (são só alguns). */
export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const list = Array.isArray(body?.episodes) ? (body.episodes as EpisodeBody[]) : null;
  if (!list) {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const rows: { title: string; videoUrl: string; duration: string | null; displayOrder: number; published: boolean }[] = [];
  for (const [i, e] of list.entries()) {
    const title = String(e.title ?? "").trim();
    const videoUrl = String(e.videoUrl ?? "").trim();
    if (!title && !videoUrl) continue; // linha vazia
    if (!title) {
      return NextResponse.json({ error: `Episódio ${i + 1}: informe o título.` }, { status: 400 });
    }
    if (!getEmbedUrl(videoUrl)) {
      return NextResponse.json(
        { error: `Episódio ${i + 1}: use um link válido do YouTube (ou Vimeo).` },
        { status: 400 },
      );
    }
    rows.push({
      title: title.slice(0, 160),
      videoUrl,
      duration: String(e.duration ?? "").trim().slice(0, 30) || null,
      displayOrder: rows.length,
      published: e.published === undefined ? true : Boolean(e.published),
    });
  }

  await prisma.$transaction([
    prisma.episode.deleteMany({}),
    prisma.episode.createMany({ data: rows }),
  ]);
  return NextResponse.json({ ok: true, count: rows.length });
}
