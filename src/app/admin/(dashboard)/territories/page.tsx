import { prisma } from "@/lib/prisma";
import TerritoriesTable from "@/components/admin/TerritoriesTable";

export const dynamic = "force-dynamic";

export default async function AdminTerritoriesPage() {
  const locations = await prisma.location.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-black">Territórios</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dados jornalísticos usados no scrollytelling (cobertura, categoria
          de acesso, nível de risco). O "episódio-âncora" de cada continente
          é marcado na edição da matéria, não aqui.
        </p>
      </div>

      {locations.length === 0 ? (
        <p className="text-neutral-500">Nenhum território cadastrado ainda.</p>
      ) : (
        <TerritoriesTable
          initialTerritories={locations.map((location) => ({
            id: location.id,
            name: location.name,
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
