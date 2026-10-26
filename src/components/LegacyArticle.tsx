import HeroImageWithVideoModal from "@/components/HeroImageWithVideoModal";
import ImageGallery from "@/components/ImageGallery";
import type { ReportData } from "@/lib/report";

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Matéria em texto livre (modelo antigo). Usada quando o território ainda
 * não tem dados do modelo de reportagem em 7 blocos. */
export default function LegacyArticle({
  article,
}: {
  article: ReportData["article"];
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {article.category && (
        <p className="mb-3 text-xs font-bold tracking-wide text-amber-700 uppercase">
          {article.category}
        </p>
      )}
      <h1 className="mb-4 font-serif text-3xl leading-tight font-black text-neutral-900 sm:text-4xl">
        {article.title}
      </h1>
      {article.subtitle && (
        <p className="mb-4 text-xl text-neutral-600">{article.subtitle}</p>
      )}
      <p className="mb-6 border-b border-neutral-200 pb-6 text-sm text-neutral-500">
        {article.author ? `Por ${article.author} · ` : ""}
        {formatDate(article.publishedAt)}
      </p>

      <div className="-mx-4 mb-8 sm:mx-0">
        <HeroImageWithVideoModal
          imageUrl={article.heroImageUrl}
          videoUrl={article.videoUrl}
          alt={article.title}
        />
      </div>

      <div
        className="prose prose-neutral prose-lg max-w-none prose-headings:font-serif prose-a:text-amber-700"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      <ImageGallery items={article.galleryItems} articleTitle={article.title} />
    </article>
  );
}
