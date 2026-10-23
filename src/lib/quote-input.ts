import { isQuoteKind, QUOTE_KINDS } from "@/lib/quote-kinds";
import { parseTimecode } from "@/lib/time";

export type QuoteInput = {
  kind: string;
  text: string;
  journalistId: number | null;
  locationId: number | null;
  continent: string | null;
  videoUrl: string | null;
  videoStartSeconds: number | null;
  audioUrl: string | null;
  sourceNote: string | null;
  needsReview: boolean;
  published: boolean;
  displayOrder: number;
};

const str = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : null;
const id = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export function parseQuoteBody(body: unknown): QuoteInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Corpo inválido." };
  const b = body as Record<string, unknown>;
  if (!isQuoteKind(b.kind)) return { error: "Tipo de fala inválido." };
  const meta = QUOTE_KINDS.find((k) => k.value === b.kind)!;

  const text = str(b.text);
  if (!text) return { error: "O texto da fala é obrigatório." };

  const journalistId = id(b.journalistId);
  const locationId = id(b.locationId);
  const continent = str(b.continent);

  if (meta.scope === "location" && !locationId) {
    return { error: "Escolha o território dessa fala." };
  }
  if (meta.scope === "continent" && !continent) {
    return { error: "Escolha o continente do capítulo." };
  }
  if (meta.value !== "CAPITULO" && !journalistId) {
    return { error: "Escolha o jornalista que fez essa fala." };
  }

  let videoStartSeconds: number | null = null;
  if (str(b.videoStart)) {
    videoStartSeconds = parseTimecode(b.videoStart);
    if (videoStartSeconds === null) {
      return { error: 'Minuto do vídeo inválido. Use o formato "23:50".' };
    }
  }

  const order = Number(b.displayOrder);
  return {
    kind: meta.value,
    text,
    journalistId,
    locationId: meta.scope === "location" ? locationId : null,
    continent: meta.scope === "continent" ? continent : null,
    videoUrl: str(b.videoUrl),
    videoStartSeconds,
    audioUrl: str(b.audioUrl),
    sourceNote: str(b.sourceNote),
    needsReview: b.needsReview === undefined ? true : Boolean(b.needsReview),
    published: Boolean(b.published),
    displayOrder: Number.isFinite(order) ? Math.trunc(order) : 0,
  };
}
