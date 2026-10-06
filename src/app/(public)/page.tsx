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
              Onde um jornalista precisa ir para contar uma guerra?
            </h1>
            <p className="mt-2 text-sm text-neutral-300">
              E o que ele encontra quando chega lá? Uma série de reportagens
              sobre os desafios geográficos, políticos e operacionais do
              jornalismo de cobertura de conflitos e direitos humanos ao
              redor do mundo. Clique nos marcadores do mapa para explorar
              cada território.
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
