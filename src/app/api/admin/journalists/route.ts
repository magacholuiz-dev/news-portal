import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { parseJournalistBody } from "@/lib/journalist-input";

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = parseJournalistBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const base = slugify(parsed.name) || `jornalista-${Date.now()}`;
  let slug = base;
  let attempt = 1;
  while (await prisma.journalist.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  const { photos, ...data } = parsed;
  const journalist = await prisma.journalist.create({
    data: {
      ...data,
      slug,
      photos: { create: photos.map((p, i) => ({ ...p, displayOrder: i })) },
    },
  });
  return NextResponse.json({ journalist }, { status: 201 });
}
