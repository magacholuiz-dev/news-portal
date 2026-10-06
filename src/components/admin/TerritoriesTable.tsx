"use client";

import { useState } from "react";

export type TerritoryRow = {
  id: number;
  name: string;
  continent: string | null;
  continentOrder: number | null;
  displayOrder: number | null;
  coveragePct: number | null;
  mediaAttentionClass: string | null;
  journalistNote: string | null;
  accessCategory: string | null;
  riskLevelRSF: string | null;
};

const CONTINENT_OPTIONS = [
  "Europa",
  "Asia e Oriente Medio",
  "Africa",
  "Americas",
  "Oceania",
];

const ACCESS_CATEGORY_OPTIONS = [
  "Visto Concedido",
  "Zona de Risco",
  "Entrada Barrada",
];

type FieldValue = string | number | null;

export default function TerritoriesTable({
  initialTerritories,
}: {
  initialTerritories: TerritoryRow[];
}) {
  const [territories, setTerritories] = useState(initialTerritories);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  function updateField(id: number, key: keyof TerritoryRow, value: FieldValue) {
    setTerritories((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)),
    );
  }

  async function handleSave(territory: TerritoryRow) {
    setSavingId(territory.id);
    setErrorId(null);
    try {
      const res = await fetch(`/api/admin/territories/${territory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          continent: territory.continent,
          continentOrder: territory.continentOrder,
          displayOrder: territory.displayOrder,
          coveragePct: territory.coveragePct,
          mediaAttentionClass: territory.mediaAttentionClass,
          journalistNote: territory.journalistNote,
          accessCategory: territory.accessCategory,
          riskLevelRSF: territory.riskLevelRSF,
        }),
      });
      if (!res.ok) {
        setErrorId(territory.id);
        return;
      }
      setSavedId(territory.id);
      setTimeout(() => setSavedId((prev) => (prev === territory.id ? null : prev)), 2000);
    } catch {
      setErrorId(territory.id);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {territories
        .slice()
        .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
        .map((territory) => (
          <div
            key={territory.id}
            className="rounded-md border border-neutral-200 bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                {territory.name}
              </h3>
              <div className="flex items-center gap-3">
                {savedId === territory.id && (
                  <span className="text-xs font-semibold text-green-600">
                    Salvo
                  </span>
                )}
                {errorId === territory.id && (
                  <span className="text-xs font-semibold text-red-600">
                    Falha ao salvar
                  </span>
                )}
                <button
                  type="button"
                  disabled={savingId === territory.id}
                  onClick={() => handleSave(territory)}
                  className="rounded-sm bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {savingId === territory.id ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Continente (passo do scroll)
                </span>
                <select
                  value={territory.continent ?? ""}
                  onChange={(e) =>
                    updateField(territory.id, "continent", e.target.value || null)
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                >
                  <option value="">—</option>
                  {CONTINENT_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Ordem do continente (1-5)
                </span>
                <input
                  type="number"
                  value={territory.continentOrder ?? ""}
                  onChange={(e) =>
                    updateField(
                      territory.id,
                      "continentOrder",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Ordem de exibição (rota, 1-14)
                </span>
                <input
                  type="number"
                  value={territory.displayOrder ?? ""}
                  onChange={(e) =>
                    updateField(
                      territory.id,
                      "displayOrder",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Cobertura (%)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={territory.coveragePct ?? ""}
                  onChange={(e) =>
                    updateField(
                      territory.id,
                      "coveragePct",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Classificação de atenção midiática
                </span>
                <input
                  value={territory.mediaAttentionClass ?? ""}
                  onChange={(e) =>
                    updateField(
                      territory.id,
                      "mediaAttentionClass",
                      e.target.value || null,
                    )
                  }
                  placeholder="ex: Hipercoberta"
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Categoria de acesso
                </span>
                <select
                  value={territory.accessCategory ?? ""}
                  onChange={(e) =>
                    updateField(
                      territory.id,
                      "accessCategory",
                      e.target.value || null,
                    )
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                >
                  <option value="">— Dado pendente —</option>
                  {ACCESS_CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Nível de risco (RSF)
                </span>
                <input
                  value={territory.riskLevelRSF ?? ""}
                  onChange={(e) =>
                    updateField(territory.id, "riskLevelRSF", e.target.value || null)
                  }
                  placeholder="— Dado pendente —"
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

              <label className="block text-xs sm:col-span-2 lg:col-span-4">
                <span className="mb-1 block font-medium text-neutral-600">
                  Observação jornalística
                </span>
                <textarea
                  rows={2}
                  value={territory.journalistNote ?? ""}
                  onChange={(e) =>
                    updateField(
                      territory.id,
                      "journalistNote",
                      e.target.value || null,
                    )
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>
            </div>
          </div>
        ))}
    </div>
  );
}
