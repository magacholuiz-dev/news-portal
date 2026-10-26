import type { Journalist, Quote } from "@/generated/prisma/client";

/** Fala já pronta pra tela (sem depender de Prisma no cliente). */
export type QuoteDTO = {
  id: number;
  kind: string;
  text: string;
  journalistName: string | null;
  journalistPhoto: string | null;
  journalistSlug: string | null;
  videoUrl: string | null;
  videoStartSeconds: number | null;
  audioUrl: string | null;
  /** Entrevista em áudio do jornalista no Spotify. */
  spotifyUrl: string | null;
};

export function toQuoteDTO(
  q: Quote & { journalist: Journalist | null },
): QuoteDTO {
  const j = q.journalist;
  return {
    id: q.id,
    kind: q.kind,
    text: q.text,
    journalistName: j?.name ?? null,
    journalistPhoto: j?.photoUrl ?? null,
    journalistSlug: j && j.published ? j.slug : null,
    videoUrl: q.videoUrl,
    videoStartSeconds: q.videoStartSeconds,
    audioUrl: q.audioUrl,
    spotifyUrl: j?.spotifyUrl ?? null,
  };
}
