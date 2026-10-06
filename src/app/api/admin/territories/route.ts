import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ locations });
}
