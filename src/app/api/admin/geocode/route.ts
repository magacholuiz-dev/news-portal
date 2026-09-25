import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "Informe um local para buscar." }, {
      status: 400,
    });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");

  const res = await fetch(url, {
    headers: {
      // Exigido pela política de uso do Nominatim: identificar a aplicação.
      "User-Agent": "PortalNoticiaAdmin/1.0 (+https://news-portal-gamma-opal.vercel.app)",
      "Accept-Language": "pt-BR",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Falha ao buscar localização." },
      { status: 502 },
    );
  }

  const results = (await res.json()) as NominatimResult[];

  return NextResponse.json({
    results: results.map((r) => ({
      name: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
    })),
  });
}
