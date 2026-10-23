import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseJournalistBody } from "@/lib/journalist-input";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await params;
  const journalistId = Number(id);
  const existing = await prisma.journalist.findUnique({
    where: { id: journalistId },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Jornalista não encontrado." },
      { status: 404 },
    );
  }
  const parsed = parseJournalistBody(await request.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { photos, ...data } = parsed;
  const journalist = await prisma.journalist.update({
    where: { id: journalistId },
    data: {
      ...data,
      photos: {
        deleteMany: {},
        create: photos.map((p, i) => ({ ...p, displayOrder: i })),
      },
    },
  });
  return NextResponse.json({ journalist });
}

/** Exclui o jornalista e a galeria dele. As falas ficam (sem autor) e caem
 * em rascunho de novo pra alguém reatribuir. */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await params;
  const journalistId = Number(id);
  await prisma.$transaction([
    prisma.quote.updateMany({
      where: { journalistId, kind: { not: "CAPITULO" } },
      data: { published: false },
    }),
    prisma.journalist.deleteMany({ where: { id: journalistId } }),
  ]);
  return NextResponse.json({ ok: true });
}
