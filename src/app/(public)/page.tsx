import { prisma } from "@/lib/prisma";
import type { LocationWithArticles } from "@/components/WorldMap";
import WorldMapLoader from "@/components/WorldMapLoader";
import StoryList from "@/components/StoryList";

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
      articles: location.articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        heroImageUrl: article.heroImageUrl,
        videoUrl: article.videoUrl,
        author: article.author,
        category: article.category,
        publishedAt: article.publishedAt?.toISOString() ?? null,
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

  return (
    <>
      <div className="relative h-[75vh] min-h-[500px] w-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex justify-center px-4 pt-6 sm:justify-start sm:px-6">
          <div className="pointer-events-auto max-w-sm rounded-md border border-white/10 bg-neutral-900/85 p-4 shadow-2xl backdrop-blur-md">
            <h1 className="font-serif text-xl font-black text-white">
              Nome do Projeto
            </h1>
            <p className="mt-1 text-sm text-neutral-300">
              Uma série documental sobre conflitos ao redor do mundo. Clique
              nos marcadores do mapa para assistir aos episódios de cada
              local.
            </p>
          </div>
        </div>

        {mapLocations.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-neutral-900 px-4 text-center text-sm text-neutral-400">
            Nenhuma reportagem com localização publicada ainda. Acesse{" "}
            <a href="/admin/login" className="ml-1 text-white underline">
              /admin/login
            </a>{" "}
            para adicionar a primeira.
          </div>
        ) : (
          <WorldMapLoader locations={mapLocations} />
        )}
      </div>

      <StoryList articles={storyArticles} />
    </>
  );
}
