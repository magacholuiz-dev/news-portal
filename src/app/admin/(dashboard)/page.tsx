import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticlesTable from "@/components/admin/ArticlesTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-black">Matérias</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-sm bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + Nova matéria
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-neutral-500">
          Nenhuma matéria cadastrada ainda.
        </p>
      ) : (
        <ArticlesTable
          initialArticles={articles.map((article) => ({
            ...article,
            createdAt: article.createdAt.toISOString(),
            publishedAt: article.publishedAt?.toISOString() ?? null,
          }))}
        />
      )}
    </div>
  );
}
