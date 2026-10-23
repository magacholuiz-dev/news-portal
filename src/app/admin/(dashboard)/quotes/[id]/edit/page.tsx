import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/admin/QuoteForm";
import { formatTimecode } from "@/lib/time";
import type { QuoteKind } from "@/lib/quote-kinds";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [q, journalists, locations] = await Promise.all([
    prisma.quote.findUnique({ where: { id: Number(id) } }),
    prisma.journalist.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!q) notFound();
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-black">Editar fala</h1>
      <QuoteForm
        journalists={journalists}
        locations={locations}
        initialValues={{
          id: q.id,
          kind: q.kind as QuoteKind,
          text: q.text,
          journalistId: q.journalistId ? String(q.journalistId) : "",
          locationId: q.locationId ? String(q.locationId) : "",
          continent: q.continent ?? "",
          videoUrl: q.videoUrl ?? "",
          videoStart: formatTimecode(q.videoStartSeconds),
          audioUrl: q.audioUrl ?? "",
          sourceNote: q.sourceNote ?? "",
          needsReview: q.needsReview,
          published: q.published,
          displayOrder: q.displayOrder,
        }}
      />
    </div>
  );
}
