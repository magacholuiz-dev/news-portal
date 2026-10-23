import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JournalistForm from "@/components/admin/JournalistForm";

export const dynamic = "force-dynamic";

export default async function EditJournalistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [j, locations] = await Promise.all([
    prisma.journalist.findUnique({
      where: { id: Number(id) },
      include: { photos: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!j) notFound();
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-black">Editar jornalista</h1>
      <JournalistForm
        locations={locations}
        initialValues={{
          id: j.id,
          name: j.name,
          role: j.role ?? "",
          photoUrl: j.photoUrl ?? "",
          bio: j.bio ?? "",
          conflictsCovered: j.conflictsCovered ?? "",
          displayOrder: j.displayOrder,
          published: j.published,
          photos: j.photos.map((p) => ({
            key: String(p.id),
            imageUrl: p.imageUrl,
            caption: p.caption ?? "",
            credit: p.credit ?? "",
            locationId: p.locationId ? String(p.locationId) : "",
          })),
        }}
      />
    </div>
  );
}
