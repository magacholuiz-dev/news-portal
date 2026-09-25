"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type AdminArticleRow = {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  published: boolean;
  createdAt: string;
  publishedAt: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default function ArticlesTable({
  initialArticles,
}: {
  initialArticles: AdminArticleRow[];
}) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function togglePublished(article: AdminArticleRow) {
    setPendingId(article.id);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !article.published }),
      });
      if (res.ok) {
        const { article: updated } = await res.json();
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id
              ? {
                  ...a,
                  published: updated.published,
                  publishedAt: updated.publishedAt,
                }
              : a,
          ),
        );
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(article: AdminArticleRow) {
    if (!confirm(`Excluir a matéria "${article.title}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setPendingId(article.id);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
        router.refresh();
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase">
          <tr>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {articles.map((article) => (
            <tr key={article.id}>
              <td className="max-w-xs truncate px-4 py-3 font-medium text-neutral-900">
                {article.title}
              </td>
              <td className="px-4 py-3 text-neutral-500">
                {article.category ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    article.published
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {article.published ? "Publicada" : "Rascunho"}
                </span>
              </td>
              <td className="px-4 py-3 text-neutral-500">
                {formatDate(article.publishedAt ?? article.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-3 text-sm">
                  <button
                    type="button"
                    disabled={pendingId === article.id}
                    onClick={() => togglePublished(article)}
                    className="text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
                  >
                    {article.published ? "Despublicar" : "Publicar"}
                  </button>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    disabled={pendingId === article.id}
                    onClick={() => handleDelete(article)}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
