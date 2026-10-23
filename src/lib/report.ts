import { prisma } from "@/lib/prisma";
import { toQuoteDTO, type QuoteDTO } from "@/lib/public-types";

export type ReportData = {
  article: NonNullable<Awaited<ReturnType<typeof loadArticle>>>;
  location: NonNullable<
    NonNullable<Awaited<ReturnType<typeof loadArticle>>>["location"]
  > | null;
  fala: QuoteDTO | null;
  cobertura: QuoteDTO[];
  podcast: QuoteDTO[];
  photos: { id: number; imageUrl: string; caption: string | null; credit: string | null; journalistName: string }[];
  structured: boolean;
};

async function loadArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      galleryItems: { orderBy: { order: "asc" } },
      location: true,
    },
  });
}

/** Reportagem de um território: artigo + dados estruturados do ponto +
 * falas publicadas + fotos em campo. `structured` diz se já há dado do
 * modelo de 7 blocos; senão a página cai no texto livre da matéria. */
export async function getReport(slug: string): Promise<ReportData | null> {
  const article = await loadArticle(slug);
  if (!article || !article.published) return null;
  const location = article.location;

  let fala: QuoteDTO | null = null;
  let cobertura: QuoteDTO[] = [];
  let podcast: QuoteDTO[] = [];
  let photos: ReportData["photos"] = [];

  if (location) {
    const [quotes, fieldPhotos] = await Promise.all([
      prisma.quote.findMany({
        where: {
          locationId: location.id,
          published: true,
          kind: { in: ["FALA", "COBERTURA", "PODCAST"] },
        },
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        include: { journalist: true },
      }),
      prisma.fieldPhoto.findMany({
        where: { locationId: location.id, journalist: { published: true } },
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        include: { journalist: true },
      }),
    ]);
    const dtos = quotes.map(toQuoteDTO);
    fala = dtos.find((q) => q.kind === "FALA") ?? null;
    cobertura = dtos.filter((q) => q.kind === "COBERTURA");
    podcast = dtos.filter((q) => q.kind === "PODCAST");
    photos = fieldPhotos.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption,
      credit: p.credit,
      journalistName: p.journalist.name,
    }));
  }

  const structured = Boolean(
    location &&
      (location.entryPhrase ||
        location.victimsNumber ||
        location.conflictSummary ||
        fala ||
        cobertura.length ||
        podcast.length ||
        photos.length),
  );

  return { article, location, fala, cobertura, podcast, photos, structured };
}

export async function getJournalistBySlug(slug: string) {
  const j = await prisma.journalist.findUnique({
    where: { slug },
    include: {
      photos: {
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        include: { location: true },
      },
      quotes: {
        where: { published: true },
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        include: { journalist: true, location: true },
      },
    },
  });
  if (!j || !j.published) return null;
  return j;
}
