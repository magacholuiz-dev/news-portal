import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_SITE_TITLE, getSiteTitle } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return NextResponse.json({ siteTitle: await getSiteTitle() });
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const siteTitle =
    typeof body?.siteTitle === "string" ? body.siteTitle.trim() : "";
  if (!siteTitle) {
    return NextResponse.json(
      { error: "O título não pode ficar vazio." },
      { status: 400 },
    );
  }
  if (siteTitle.length > 80) {
    return NextResponse.json(
      { error: "O título pode ter no máximo 80 caracteres." },
      { status: 400 },
    );
  }

  await prisma.siteSetting.upsert({
    where: { key: "siteTitle" },
    update: { value: siteTitle },
    create: { key: "siteTitle", value: siteTitle },
  });

  return NextResponse.json({ siteTitle: siteTitle || DEFAULT_SITE_TITLE });
}
