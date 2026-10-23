import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type LocationInput = {
  name: string;
  lat: number;
  lng: number;
  continent?: string | null;
};

/** Lê o campo `location` vindo do formulário admin; retorna null se ausente/inválido. */
export function parseLocationInput(
  raw: unknown,
  continent?: unknown,
): LocationInput | null {
  if (!raw || typeof raw !== "object") return null;
  const { name, lat, lng } = raw as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return null;
  }
  return {
    name,
    lat,
    lng,
    continent:
      typeof continent === "string" && continent.trim()
        ? continent.trim()
        : null,
  };
}

const COORD_PRECISION = 3; // ~100m, o suficiente pra reaproveitar o mesmo local

function roundCoord(value: number) {
  const factor = 10 ** COORD_PRECISION;
  return Math.round(value * factor) / factor;
}

/** Reaproveita um Location existente com coordenadas próximas, ou cria um novo. */
export async function findOrCreateLocation(input: LocationInput) {
  const lat = roundCoord(input.lat);
  const lng = roundCoord(input.lng);

  const existing = await prisma.location.findFirst({ where: { lat, lng } });
  if (existing) {
    // Mantém o continente em dia quando o admin escolhe um no formulário.
    if (input.continent && input.continent !== existing.continent) {
      return prisma.location.update({
        where: { id: existing.id },
        data: { continent: input.continent },
      });
    }
    return existing;
  }

  const baseSlug = slugify(input.name) || `local-${Date.now()}`;
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.location.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  return prisma.location.create({
    data: {
      name: input.name.trim(),
      slug,
      lat,
      lng,
      continent: input.continent ?? null,
    },
  });
}
