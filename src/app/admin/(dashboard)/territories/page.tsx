import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TerritoriesTable from "@/components/admin/TerritoriesTable";

export const dynamic = "force-dynamic";

export default async function AdminTerritoriesPage() {
  const locations = await prisma.location.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      articles: {
        select: { id: true, title: true, published: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-black">Pontos do mapa</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Cada ponto do mapa com a sua notícia. Aqui você edita o nome, a
            posição e os dados de cobertura/acesso/risco, abre a notícia
            vinculada ou exclui o ponto. O &ldquo;episódio-âncora&rdquo; de
            cada continente é marcado na edição da matéria.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="rounded-sm bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + Novo ponto
        </Link>
      </div>

      {locations.length === 0 ? (
        <p className="text-neutral-500">Nenhum território cadastrado ainda.</p>
      ) : (
        <TerritoriesTable
          initialTerritories={locations.map((location) => ({
            id: location.id,
            name: location.name,
            lat: location.lat,
            lng: location.lng,
            articles: location.articles,
            continent: location.continent,
            continentOrder: location.continentOrder,
            displayOrder: location.displayOrder,
            coveragePct: location.coveragePct,
            mediaAttentionClass: location.mediaAttentionClass,
            journalistNote: location.journalistNote,
            accessCategory: location.accessCategory,
            riskLevelRSF: location.riskLevelRSF,
          }))}
        />
      )}
    </div>
  );
}
