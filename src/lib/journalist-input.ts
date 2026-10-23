type PhotoInput = {
  imageUrl: string;
  caption: string | null;
  credit: string | null;
  locationId: number | null;
};

export type JournalistInput = {
  name: string;
  role: string | null;
  photoUrl: string | null;
  bio: string | null;
  conflictsCovered: string | null;
  displayOrder: number;
  published: boolean;
  photos: PhotoInput[];
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

  const order = Number(b.displayOrder);
  return {
    name,
    role: str(b.role),
    photoUrl: str(b.photoUrl),
    bio: str(b.bio),
    conflictsCovered: str(b.conflictsCovered),
    displayOrder: Number.isFinite(order) ? Math.trunc(order) : 0,
    published: b.published === undefined ? true : Boolean(b.published),
    photos,
  };
}
