import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminArticleForm from "@/components/admin/AdminArticleForm";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: PageParams) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
    include: {
      galleryItems: { orderBy: { order: "asc" } },
      location: true,
    },
  });

  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-black">Editar matéria</h1>
      <AdminArticleForm
        initialValues={{
          id: article.id,
          title: article.title,
          subtitle: article.subtitle ?? "",
          excerpt: article.excerpt ?? "",
          slug: article.slug,
          category: article.category ?? "",
          author: article.author ?? "",
          heroImageUrl: article.heroImageUrl,
          videoUrl: article.videoUrl ?? "",
          contentHtml: article.contentHtml,
          published: article.published,
          galleryItems: article.galleryItems.map((item) => ({
            key: String(item.id),
            imageUrl: item.imageUrl,
            videoUrl: item.videoUrl ?? "",
            caption: item.caption ?? "",
          })),
          location: article.location
            ? {
                name: article.location.name,
                lat: article.location.lat,
                lng: article.location.lng,
              }
            : null,
        }}
      />
    </div>
  );
}
