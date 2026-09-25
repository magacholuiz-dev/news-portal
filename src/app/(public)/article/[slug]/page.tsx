import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HeroImageWithVideoModal from "@/components/HeroImageWithVideoModal";
import ImageGallery from "@/components/ImageGallery";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { galleryItems: { orderBy: { order: "asc" } } },
  });
  if (!article || !article.published) return null;
  return article;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

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

export default async function ArticlePage({ params }: PageParams) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {article.category && (
        <p className="mb-3 text-xs font-bold tracking-wide text-red-700 uppercase">
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
        className="prose prose-neutral prose-lg max-w-none prose-headings:font-serif prose-a:text-red-700"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      <ImageGallery items={article.galleryItems} articleTitle={article.title} />
    </article>
  );
}
