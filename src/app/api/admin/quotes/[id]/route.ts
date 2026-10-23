import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseQuoteBody } from "@/lib/quote-input";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await params;
  const quoteId = Number(id);
  const existing = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!existing) {
    return NextResponse.json({ error: "Fala não encontrada." }, { status: 404 });
  }
  const parsed = parseQuoteBody(await request.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const quote = await prisma.quote.update({ where: { id: quoteId }, data: parsed });
  return NextResponse.json({ quote });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await params;
  await prisma.quote.deleteMany({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
