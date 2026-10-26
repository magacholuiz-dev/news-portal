import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings, HEX_COLOR, SETTING_KEYS } from "@/lib/settings";

const MAX_LEN: Record<string, number> = {
  siteTitle: 80,
  heroTrailerUrl: 300,
  closingQuoteText: 400,
  closingQuoteAuthor: 120,
  heroColor1: 7,
  heroColor2: 7,
  faviconUrl: 500,
};

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return NextResponse.json(await getSiteSettings());
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  // O título é obrigatório; os demais campos podem ser esvaziados.
  if ("siteTitle" in body && !String(body.siteTitle ?? "").trim()) {
    return NextResponse.json(
      { error: "O título não pode ficar vazio." },
      { status: 400 },
    );
  }

  for (const key of SETTING_KEYS) {
    if (!(key in body)) continue;
    const value = String(body[key] ?? "").trim();
    if ((key === "heroColor1" || key === "heroColor2") && value && !HEX_COLOR.test(value)) {
      return NextResponse.json(
        { error: "Cor inválida. Use o formato hexadecimal, ex.: #eb6a4b." },
        { status: 400 },
      );
    }
    if (value.length > MAX_LEN[key]) {
      return NextResponse.json(
        { error: `"${key}" passa de ${MAX_LEN[key]} caracteres.` },
        { status: 400 },
      );
    }
    if (value) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    } else {
      await prisma.siteSetting.deleteMany({ where: { key } });
    }
  }

  return NextResponse.json(await getSiteSettings());
}
