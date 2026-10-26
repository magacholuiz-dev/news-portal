import { prisma } from "@/lib/prisma";
import { findOrCreateLocation } from "@/lib/location";

type PhotoInput = {
  imageUrl: string;
  caption: string | null;
  credit: string | null;
  locationId: number | null;
};

export type PlaceInput = {
  locationId: number | null;
  label: string | null;
  name: string;
  lat: number | null;
  lng: number | null;
};

export type JournalistInput = {
  name: string;
  role: string | null;
  photoUrl: string | null;
  bio: string | null;
  conflictsCovered: string | null;
  spotifyUrl: string | null;
  displayOrder: number;
  published: boolean;
  photos: PhotoInput[];
  places: PlaceInput[];
};

const str = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : null;

export function parseJournalistBody(
  body: unknown,
): JournalistInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Corpo inválido." };
  const b = body as Record<string, unknown>;
  const name = str(b.name);
  if (!name) return { error: "O nome é obrigatório." };

  const rawPhotos = Array.isArray(b.photos) ? b.photos : [];
  const photos: PhotoInput[] = [];
  for (const p of rawPhotos) {
    if (!p || typeof p !== "object") continue;
    const r = p as Record<string, unknown>;
    const imageUrl = str(r.imageUrl);
    if (!imageUrl) continue;
    const loc = Number(r.locationId);
    photos.push({
      imageUrl,
      caption: str(r.caption),
      credit: str(r.credit),
      locationId: Number.isInteger(loc) && loc > 0 ? loc : null,
    });
  }

  const places: PlaceInput[] = [];
  for (const p of Array.isArray(b.places) ? b.places : []) {
    if (!p || typeof p !== "object") continue;
    const r = p as Record<string, unknown>;
    const name = str(r.name);
    const id = Number(r.locationId);
    const lat = typeof r.lat === "number" ? r.lat : null;
    const lng = typeof r.lng === "number" ? r.lng : null;
    const locationId = Number.isInteger(id) && id > 0 ? id : null;
    if (!locationId && (!name || lat === null || lng === null)) continue;
    places.push({ locationId, label: str(r.label), name: name ?? "", lat, lng });
  }

  const order = Number(b.displayOrder);
  return {
    name,
    role: str(b.role),
    photoUrl: str(b.photoUrl),
    bio: str(b.bio),
    conflictsCovered: str(b.conflictsCovered),
    spotifyUrl: str(b.spotifyUrl),
    displayOrder: Number.isFinite(order) ? Math.trunc(order) : 0,
    published: b.published === undefined ? true : Boolean(b.published),
    photos,
    places,
  };
}

/** Resolve os lugares do formulário em `JournalistPlace` (reaproveita pontos
 * existentes ou cria novos), sem repetir o mesmo ponto. */
export async function resolvePlaces(places: PlaceInput[]) {
  const out: { locationId: number; label: string | null; displayOrder: number }[] = [];
  for (const p of places) {
    let locationId = p.locationId;
    if (locationId) {
      const exists = await prisma.location.findUnique({ where: { id: locationId } });
      if (!exists) locationId = null;
    }
    if (!locationId && p.lat !== null && p.lng !== null) {
      locationId = (await findOrCreateLocation({ name: p.name, lat: p.lat, lng: p.lng })).id;
    }
    if (!locationId || out.some((o) => o.locationId === locationId)) continue;
    out.push({ locationId, label: p.label, displayOrder: out.length });
  }
  return out;
}
