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
    month: "2-digit",
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
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-neutral-900 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2.5">
          <p className="text-xs font-bold tracking-wide text-amber-400 uppercase">
            {locationName}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-neutral-400 hover:bg-white/10 hover:text-white"
          >
            &times;
          </button>
        </div>

        {articles.length > 1 && (
          <div className="flex gap-0 divide-x divide-white/10 overflow-x-auto border-b border-white/10 bg-black/20">
            {articles.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`w-36 shrink-0 px-3 py-2.5 text-left transition-colors ${
                  index === activeIndex
                    ? "bg-amber-400/10"
                    : "hover:bg-white/5"
                }`}
              >
                <p
                  className={`text-[10px] font-bold tracking-wide uppercase ${
                    index === activeIndex ? "text-amber-400" : "text-neutral-400"
                  }`}
                >
                  {item.category ?? "Episódio"}
                  {item.publishedAt && (
                    <span className="ml-1.5 font-normal text-neutral-500">
                      {formatDate(item.publishedAt)}
                    </span>
                  )}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug font-semibold text-neutral-100">
                  {item.title}
                </p>
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
          <p className="mb-2 text-xs font-bold tracking-wide text-amber-400 uppercase">
            {[article.category, formatDate(article.publishedAt)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <h2 className="mb-2 font-serif text-2xl leading-tight font-black text-white">
            {article.title}
          </h2>
          {article.author && (
            <p className="mb-3 text-xs text-neutral-400">
              Por {article.author}
            </p>
          )}
          {article.excerpt && (
            <p className="mb-4 text-sm leading-relaxed text-neutral-300">
              {article.excerpt}
            </p>
          )}
          <Link
            href={`/article/${article.slug}`}
            className="text-sm font-semibold text-amber-400 hover:underline"
          >
            Ver reportagem completa &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
