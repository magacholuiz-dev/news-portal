import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

/** Lê um campo de texto opcional do corpo da requisição: string vazia vira null. */
function readOptionalString(body: Record<string, unknown>, key: string) {
  const raw = body[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : null;
}

/** Lê um campo numérico opcional: string vazia/NaN vira null. */
function readOptionalNumber(body: Record<string, unknown>, key: string) {
  if (!(key in body)) return undefined;
  const raw = body[key];
  if (raw === null || raw === "") return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Atualização parcial dos campos jornalísticos de um território (Location). */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const locationId = Number(id);

  const existing = await prisma.location.findUnique({
    where: { id: locationId },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Território não encontrado." },
      { status: 404 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = {};

  const continent = readOptionalString(body, "continent");
  if (continent !== undefined) data.continent = continent;

  const mediaAttentionClass = readOptionalString(body, "mediaAttentionClass");
  if (mediaAttentionClass !== undefined)
    data.mediaAttentionClass = mediaAttentionClass;

  const journalistNote = readOptionalString(body, "journalistNote");
  if (journalistNote !== undefined) data.journalistNote = journalistNote;

  const accessCategory = readOptionalString(body, "accessCategory");
  if (accessCategory !== undefined) data.accessCategory = accessCategory;

  const riskLevelRSF = readOptionalString(body, "riskLevelRSF");
  if (riskLevelRSF !== undefined) data.riskLevelRSF = riskLevelRSF;

  const continentOrder = readOptionalNumber(body, "continentOrder");
  if (continentOrder !== undefined)
    data.continentOrder = continentOrder === null ? null : Math.trunc(continentOrder);

  const displayOrder = readOptionalNumber(body, "displayOrder");
  if (displayOrder !== undefined)
    data.displayOrder = displayOrder === null ? null : Math.trunc(displayOrder);

  const coveragePct = readOptionalNumber(body, "coveragePct");
  if (coveragePct !== undefined) data.coveragePct = coveragePct;

  const location = await prisma.location.update({
    where: { id: locationId },
    data,
  });

  return NextResponse.json({ location });
}
