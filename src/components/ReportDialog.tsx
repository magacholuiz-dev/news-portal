"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEmbedUrl } from "@/lib/video";

export type ReportArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  heroImageUrl: string;
  videoUrl: string | null;
  author: string | null;
  category: string | null;
  publishedAt: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function ReportDialog({
  locationName,
  articles,
  onClose,
}: {
  locationName: string;
  articles: ReportArticle[];
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const article = articles[activeIndex];
  const embedUrl = article.videoUrl ? getEmbedUrl(article.videoUrl) : null;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <p className="text-xs font-bold tracking-wide text-red-700 uppercase">
            {locationName}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-neutral-500 hover:bg-neutral-100"
          >
            &times;
          </button>
        </div>

        {articles.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 px-4 py-2">
            {articles.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  index === activeIndex
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        <div className="aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={article.title}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.heroImageUrl}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="p-5">
          <h2 className="mb-1 font-serif text-xl font-bold text-neutral-900">
            {article.title}
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            {[article.category, article.author, formatDate(article.publishedAt)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {article.excerpt && (
            <p className="mb-4 text-sm leading-relaxed text-neutral-700">
              {article.excerpt}
            </p>
          )}
          <Link
            href={`/article/${article.slug}`}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Ver reportagem completa &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
