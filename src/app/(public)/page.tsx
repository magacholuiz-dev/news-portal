import { prisma } from "@/lib/prisma";
import type { LocationWithArticles } from "@/components/WorldMap";
import ChapterScroll from "@/components/ChapterScroll";
import FlightPath, { type RouteStop } from "@/components/FlightPath";
import CoverageBarChart, { type CoverageRow } from "@/components/CoverageBarChart";
import ExploreSection from "@/components/ExploreSection";
import StoryList from "@/components/StoryList";
import Hero from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locations, articles] = await Promise.all([
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
  ]);

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
        <ChapterScroll locations={mapLocations} />
      )}

      {routeStops.length > 0 && (
        <>
          <FlightPath stops={routeStops} />
          <CoverageBarChart rows={coverageRows} />
        </>
      )}

      {mapLocations.length > 0 && <ExploreSection locations={mapLocations} />}

      <StoryList articles={storyArticles} />

      <section className="border-t border-neutral-200 bg-white py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="font-serif text-2xl leading-snug font-black text-neutral-900 sm:text-3xl">
            &ldquo;A notícia começa em algum lugar. Para chegar até nós,
            alguém precisou estar lá.&rdquo;
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#reportagens"
              className="rounded-sm bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Ler todas as reportagens
            </a>
            <a
              href="/sobre"
              className="rounded-sm border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Sobre o projeto e metodologia
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
