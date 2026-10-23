import { prisma } from "@/lib/prisma";
import type { LocationWithArticles } from "@/components/WorldMap";
import ChapterScroll from "@/components/ChapterScroll";
import FlightPath, { type RouteStop } from "@/components/FlightPath";
import CoverageBarChart, { type CoverageRow } from "@/components/CoverageBarChart";
import ExploreSection from "@/components/ExploreSection";
import StoryList from "@/components/StoryList";
import Hero from "@/components/Hero";
import Link from "next/link";
import TrailerSection from "@/components/TrailerSection";
import JournalistsSection from "@/components/JournalistsSection";
import { getSiteSettings } from "@/lib/settings";
import { toQuoteDTO, type QuoteDTO } from "@/lib/public-types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locations, articles, quoteRows, journalists, settings] = await Promise.all([
    prisma.location.findMany({
      where: { articles: { some: { published: true } } },
      include: {
        articles: {
          where: { published: true },
          orderBy: { publishedAt: "desc" },
        },
      },
    }),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      include: { location: true },
    }),
    prisma.quote.findMany({
      where: {
        published: true,
        kind: { in: ["QUEM_ESTEVE_LA", "FALA", "CAPITULO"] },
      },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      include: { journalist: true },
    }),
    prisma.journalist.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    getSiteSettings(),
  ]);

  // Falas reaproveitadas em vários pontos do site: aspa de cada capítulo
  // (por continente) e a fala do cartão de cada território ("Quem esteve
  // lá"; se não houver, cai na fala de destaque da reportagem).
  const chapterQuotes: Record<string, QuoteDTO> = {};
  const cardQuotes = new Map<number, QuoteDTO>();
  for (const q of quoteRows) {
    const dto = toQuoteDTO(q);
    if (q.kind === "CAPITULO" && q.continent) {
      if (!chapterQuotes[q.continent]) chapterQuotes[q.continent] = dto;
    } else if (q.locationId) {
      const current = cardQuotes.get(q.locationId);
      if (!current || (q.kind === "QUEM_ESTEVE_LA" && current.kind !== "QUEM_ESTEVE_LA")) {
        cardQuotes.set(q.locationId, dto);
      }
    }
  }

  const mapLocations: LocationWithArticles[] = locations
    .filter((location) => location.articles.length > 0)
    .map((location) => ({
      id: location.id,
      name: location.name,
      lat: location.lat,
      lng: location.lng,
      continent: location.continent,
      displayOrder: location.displayOrder,
      coveragePct: location.coveragePct,
      mediaAttentionClass: location.mediaAttentionClass,
      journalistNote: location.journalistNote,
      accessCategory: location.accessCategory,
      riskLevelRSF: location.riskLevelRSF,
      journalistsKilled: location.journalistsKilled,
      journalistsKilledNote: location.journalistsKilledNote,
      quote: cardQuotes.get(location.id) ?? null,
      reportSlug: location.articles[0]?.slug ?? null,
      articles: location.articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        heroImageUrl: article.heroImageUrl,
        videoUrl: article.videoUrl,
        author: article.author,
        category: article.category,
        publishedAt: article.publishedAt?.toISOString() ?? null,
        isAnchorEpisode: article.isAnchorEpisode,
      })),
    }));

  const storyArticles = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    heroImageUrl: article.heroImageUrl,
    category: article.category,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    locationName: article.location?.name ?? null,
  }));

  // Seção 04 (análise de dados): só territórios com Ordem_Exibicao
  // definida (os 14 do recorte jornalístico real) entram na rota aérea e
  // no gráfico de cobertura — Locations fora desse recorte (sem os
  // campos da planilha preenchidos) não aparecem aqui.
  const dataTerritories = locations
    .filter((location) => location.displayOrder !== null)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const routeStops: RouteStop[] = dataTerritories
    .filter((location) => location.coveragePct !== null)
    .map((location) => ({
      name: location.name,
      lat: location.lat,
      lng: location.lng,
      displayOrder: location.displayOrder,
      coveragePct: location.coveragePct,
      mediaAttentionClass: location.mediaAttentionClass,
      journalistNote: location.journalistNote,
      accessCategory: location.accessCategory,
      riskLevelRSF: location.riskLevelRSF,
      journalistsKilled: location.journalistsKilled,
      journalistsKilledNote: location.journalistsKilledNote,
      quote: cardQuotes.get(location.id) ?? null,
      reportSlug: location.articles[0]?.slug ?? null,
    }));

  const coverageRows: CoverageRow[] = dataTerritories
    .filter((location) => location.coveragePct !== null)
    .map((location) => ({
      name: location.name,
      coveragePct: location.coveragePct as number,
      mediaAttentionClass: location.mediaAttentionClass,
      isAnchorEpisode: location.articles.some((a) => a.isAnchorEpisode),
    }));

  return (
    <>
      <Hero />

      {settings.heroTrailerUrl && (
        <TrailerSection videoUrl={settings.heroTrailerUrl} title={settings.siteTitle} />
      )}

      {mapLocations.length === 0 ? (
        <div
          id="capitulos"
          className="flex h-[75vh] min-h-[500px] scroll-mt-16 items-center justify-center bg-neutral-900 px-4 text-center text-sm text-neutral-400"
        >
          Nenhuma reportagem com localização publicada ainda. Acesse{" "}
          <a href="/admin/login" className="ml-1 text-white underline">
            /admin/login
          </a>{" "}
          para adicionar a primeira.
        </div>
      ) : (
        <ChapterScroll locations={mapLocations} chapterQuotes={chapterQuotes} />
      )}

      {routeStops.length > 0 && (
        <>
          <FlightPath stops={routeStops} />
          <CoverageBarChart rows={coverageRows} />
        </>
      )}

      {mapLocations.length > 0 && <ExploreSection locations={mapLocations} />}

      {journalists.length > 0 ? (
        <JournalistsSection
          journalists={journalists.map((j) => ({
            slug: j.slug,
            name: j.name,
            role: j.role,
            photoUrl: j.photoUrl,
          }))}
        />
      ) : (
        // Enquanto nenhum entrevistado estiver cadastrado, mantém a lista
        // de reportagens pra seção não ficar vazia.
        <StoryList articles={storyArticles} />
      )}

      {settings.closingQuoteText && (
        <section className="border-t border-white/10 bg-neutral-950 px-6 py-20">
          <figure className="mx-auto max-w-3xl text-center">
            <blockquote className="font-serif text-3xl leading-snug font-bold text-white sm:text-4xl">
              &ldquo;{settings.closingQuoteText}&rdquo;
            </blockquote>
            {settings.closingQuoteAuthor && (
              <figcaption className="mt-5 text-sm tracking-wide text-neutral-400 uppercase">
                {settings.closingQuoteAuthor}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      <section className="border-t border-white/10 bg-neutral-950 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="font-serif text-2xl leading-snug font-black text-white sm:text-3xl">
            &ldquo;A notícia começa em algum lugar. Para chegar até nós,
            alguém precisou estar lá.&rdquo;
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#capitulos"
              className="rounded-sm bg-amber-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-amber-300"
            >
              Ver os capítulos
            </a>
            <a
              href="#analise"
              className="rounded-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
            >
              Acessar dados e metodologia
            </a>
            <Link
              href="/sobre"
              scroll={false}
              className="rounded-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
            >
              Sobre o projeto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
