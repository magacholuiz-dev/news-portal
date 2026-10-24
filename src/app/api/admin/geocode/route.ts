import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";

type Result = { name: string; lat: number; lng: number };

/** Geocoding do MapTiler (mesma chave dos mapas, em português). Mais
 * confiável a partir de servidores da Vercel que o Nominatim. */
async function searchMapTiler(query: string): Promise<Result[] | null> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key) return null;
  const url = new URL(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set("key", key);
  url.searchParams.set("language", "pt");
  url.searchParams.set("limit", "6");
  // Só países, regiões e cidades — sem ruas/endereços.
  url.searchParams.set(
    "types",
    "country,region,subregion,county,municipality,locality,place",
  );
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      features?: { place_name?: string; text?: string; center?: [number, number] }[];
    };
    return (data.features ?? [])
      .filter((f) => Array.isArray(f.center))
      .map((f) => ({
        name: f.place_name ?? f.text ?? query,
        lng: f.center![0],
        lat: f.center![1],
      }));
  } catch {
    return null;
  }
}

/** Plano B: Nominatim (OpenStreetMap). */
async function searchNominatim(query: string): Promise<Result[] | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  try {
    const res = await fetch(url, {
      headers: {
        // Exigido pela política de uso do Nominatim: identificar a aplicação.
        "User-Agent": "PortalNoticiaAdmin/1.0 (+https://pompeiamemoriasdofront.com.br)",
        "Accept-Language": "pt-BR",
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as {
      display_name: string;
      lat: string;
      lon: string;
    }[];
    return rows.map((r) => ({
      name: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
    }));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json(
      { error: "Informe um local para buscar." },
      { status: 400 },
    );
  }

  const results = (await searchMapTiler(query)) ?? (await searchNominatim(query));
  if (results === null) {
    return NextResponse.json(
      { error: "Falha ao buscar localização." },
      { status: 502 },
    );
  }
  return NextResponse.json({ results });
}
