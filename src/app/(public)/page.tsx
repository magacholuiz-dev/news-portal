import { prisma } from "@/lib/prisma";
import type { LocationWithArticles } from "@/components/WorldMap";
import ChapterScroll from "@/components/ChapterScroll";
import FlightPath, { type RouteStop } from "@/components/FlightPath";
import CoverageBarChart, { type CoverageRow } from "@/components/CoverageBarChart";
import ExploreSection from "@/components/ExploreSection";
import Hero from "@/components/Hero";
import Link from "next/link";
import TrailerSection from "@/components/TrailerSection";
import JournalistsSection from "@/components/JournalistsSection";
import StoryList from "@/components/StoryList";
import { getSiteSettings } from "@/lib/settings";
import { splitPlaces } from "@/lib/places";
import { toQuoteDTO, type QuoteDTO } from "@/lib/public-types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locations, quoteRows, journalists, stories, settings] = await Promise.all([
    // Todos os pontos: a Análise de dados mostra os 13 territórios mesmo sem
    // matéria publicada. Os mapas de notícias filtram abaixo (mapLocations).
    prisma.location.findMany({
      include: {
        journalistPlaces: {
          where: { journalist: { published: true } },
          include: { journalist: true },
        },
        articles: {
          where: { published: true },
          orderBy: { publishedAt: "desc" },
        },
      },
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
      include: {
        places: { orderBy: { displayOrder: "asc" }, include: { location: true } },
      },
    }),
    // Reportagens publicadas. Os perfis de jornalistas (categoria
    // "Jornalista") aparecem na seção Entrevistados, não aqui.
    prisma.article.findMany({
      where: {
        published: true,
        OR: [{ category: null }, { category: { not: "Jornalista" } }],
      },
      orderBy: { publishedAt: "desc" },
      include: { location: true },
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

  // Todos os territórios (os 13 do recorte + qualquer ponto com notícia);
  // os com matéria publicada são os "pontos de notícia" do mapa de Capítulos.
  const allMapLocations: LocationWithArticles[] = locations
    .filter(
      (location) =>
        location.articles.length > 0 ||
        location.displayOrder !== null ||
        location.journalistPlaces.length > 0,
    )
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
      journalists: location.journalistPlaces.map((jp) => ({
        slug: jp.journalist.slug,
        name: jp.journalist.name,
      })),
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

  const mapLocations = allMapLocations.filter((l) => l.articles.length > 0);

  // Seção 04 (análise de dados): só territórios com Ordem_Exibicao
  // definida (os 13 do recorte jornalístico real) entram na rota aérea e
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
      <Hero colorOne={settings.heroColor1} colorTwo={settings.heroColor2} />

      {/* Trailer: só aparece depois de cadastrado em Configurações. */}
      {settings.heroTrailerUrl && (
        <TrailerSection videoUrl={settings.heroTrailerUrl} title={settings.siteTitle} />
      )}

      {/* Estrutura do PDF sempre completa. Capítulos: os 5 continentes
          existem sempre; o mapa voa até onde está a notícia e só desenha
          marcadores de matérias publicadas. */}
      <ChapterScroll locations={mapLocations} chapterQuotes={chapterQuotes} />

      {routeStops.length > 0 && (
        <>
          <FlightPath stops={routeStops} />
          <CoverageBarChart rows={coverageRows} />
        </>
      )}

      {/* Explorar trabalha com os territórios (não depende de notícia). */}
      <ExploreSection
        locations={allMapLocations}
        journalists={journalists
          .filter((j) => j.places.length > 0)
          .map((j) => ({ slug: j.slug, name: j.name }))}
      />

      <StoryList
        articles={stories.map((a) => ({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          heroImageUrl: a.heroImageUrl,
          category: a.category,
          publishedAt: a.publishedAt?.toISOString() ?? null,
          locationName: a.location?.name ?? null,
        }))}
      />

      <JournalistsSection
        journalists={journalists.map((j) => ({
          slug: j.slug,
          name: j.name,
          role: j.role,
          places: j.places.length
            ? j.places.map((pl) => pl.label ?? pl.location.name)
            : splitPlaces(j.conflictsCovered),
          photoUrl: j.photoUrl,
        }))}
      />

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
