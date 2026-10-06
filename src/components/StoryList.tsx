import Link from "next/link";

export type StoryArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  heroImageUrl: string;
  category: string | null;
  publishedAt: string | null;
  locationName: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default function StoryList({ articles }: { articles: StoryArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section id="reportagens" className="scroll-mt-20 bg-neutral-900 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-4 font-serif text-3xl font-black text-white sm:text-4xl">
          Reportagens
        </h2>
        <p className="mb-10 max-w-2xl text-base text-neutral-300">
          As experiências reunidas nesta reportagem atravessam diferentes
          territórios e contextos políticos. Em alguns lugares, o desafio é
          chegar. Em outros, circular. Em outros, voltar.
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/article/${article.slug}`}
              className="group block border border-white/10 transition-colors hover:border-amber-400/50"
            >
              <div className="border-b border-white/10 px-4 py-2.5">
                <p className="text-xs font-bold tracking-wide text-amber-400 uppercase">
                  {article.locationName ?? article.category ?? "Reportagem"}
                  <span className="ml-2 font-normal text-neutral-400">
                    {formatDate(article.publishedAt)}
                  </span>
                </p>
              </div>
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.heroImageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg leading-snug font-bold text-white group-hover:underline">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-neutral-400">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
