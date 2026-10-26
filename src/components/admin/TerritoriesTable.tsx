"use client";

import { useState } from "react";
import Link from "next/link";

export type TerritoryArticle = {
  id: number;
  title: string;
  published: boolean;
};

export type TerritoryRow = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  articles: TerritoryArticle[];
  continent: string | null;
  continentOrder: number | null;
  displayOrder: number | null;
  coveragePct: number | null;
  mediaAttentionClass: string | null;
  journalistNote: string | null;
  accessCategory: string | null;
  riskLevelRSF: string | null;
  entryPhrase: string | null;
  victimsNumber: string | null;
  victimsLabel: string | null;
  conflictSummary: string | null;
  journalistsKilled: number | null;
  journalistsKilledNote: string | null;
  statsSource: string | null;
};

const CONTINENT_OPTIONS = [
  "Europa",
  "Asia e Oriente Medio",
  "Africa",
  "Americas",
];

const ACCESS_CATEGORY_OPTIONS = [
  "Visto Concedido",
  "Visto Condicionado",
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
          name: territory.name,
          lat: territory.lat,
          lng: territory.lng,
          continent: territory.continent,
          continentOrder: territory.continentOrder,
          displayOrder: territory.displayOrder,
          coveragePct: territory.coveragePct,
          mediaAttentionClass: territory.mediaAttentionClass,
          journalistNote: territory.journalistNote,
          accessCategory: territory.accessCategory,
          riskLevelRSF: territory.riskLevelRSF,
          entryPhrase: territory.entryPhrase,
          victimsNumber: territory.victimsNumber,
          victimsLabel: territory.victimsLabel,
          conflictSummary: territory.conflictSummary,
          journalistsKilled: territory.journalistsKilled,
          journalistsKilledNote: territory.journalistsKilledNote,
          statsSource: territory.statsSource,
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

  async function handleDelete(territory: TerritoryRow) {
    const n = territory.articles.length;
    const aviso =
      n > 0
        ? `Excluir o ponto "${territory.name}" e as ${n} matéria(s) vinculada(s) a ele? Essa ação não pode ser desfeita.`
        : `Excluir o ponto "${territory.name}"? Essa ação não pode ser desfeita.`;
    if (!confirm(aviso)) return;
    setSavingId(territory.id);
    try {
      const res = await fetch(`/api/admin/territories/${territory.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTerritories((prev) => prev.filter((t) => t.id !== territory.id));
      } else {
        setErrorId(territory.id);
      }
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
                <button
                  type="button"
                  disabled={savingId === territory.id}
                  onClick={() => handleDelete(territory)}
                  className="rounded-sm border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-xs sm:col-span-2">
                <span className="mb-1 block font-medium text-neutral-600">
                  Nome do ponto
                </span>
                <input
                  value={territory.name}
                  onChange={(e) =>
                    updateField(territory.id, "name", e.target.value)
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Latitude
                </span>
                <input
                  type="number"
                  step="any"
                  value={territory.lat}
                  onChange={(e) =>
                    updateField(territory.id, "lat", Number(e.target.value))
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-medium text-neutral-600">
                  Longitude
                </span>
                <input
                  type="number"
                  step="any"
                  value={territory.lng}
                  onChange={(e) =>
                    updateField(territory.id, "lng", Number(e.target.value))
                  }
                  className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                />
              </label>

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


            <details className="mt-4 rounded-sm border border-neutral-200 bg-neutral-50 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-neutral-700">
                Reportagem do território (entrada, conflito em um parágrafo, números)
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs sm:col-span-2">
                  <span className="mb-1 block font-medium text-neutral-600">
                    Entrada — frase que resume o conflito
                  </span>
                  <input
                    value={territory.entryPhrase ?? ""}
                    onChange={(e) => updateField(territory.id, "entryPhrase", e.target.value || null)}
                    placeholder="ex: A guerra mais coberta do mundo"
                    className="w-full rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block font-medium text-neutral-600">Número de vítimas em destaque</span>
                  <input
                    value={territory.victimsNumber ?? ""}
                    onChange={(e) => updateField(territory.id, "victimsNumber", e.target.value || null)}
                    placeholder="ex: 12.000"
                    className="w-full rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block font-medium text-neutral-600">O que o número conta</span>
                  <input
                    value={territory.victimsLabel ?? ""}
                    onChange={(e) => updateField(territory.id, "victimsLabel", e.target.value || null)}
                    placeholder="ex: civis mortos ou feridos"
                    className="w-full rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  />
                </label>
                <label className="block text-xs sm:col-span-2">
                  <span className="mb-1 block font-medium text-neutral-600">
                    O conflito em um parágrafo (até ~5 linhas: quem luta, desde quando e por quê)
                  </span>
                  <textarea
                    rows={4}
                    maxLength={600}
                    value={territory.conflictSummary ?? ""}
                    onChange={(e) => updateField(territory.id, "conflictSummary", e.target.value || null)}
                    className="w-full rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block font-medium text-neutral-600">Jornalistas mortos</span>
                  <input
                    type="number"
                    min={0}
                    value={territory.journalistsKilled ?? ""}
                    onChange={(e) => updateField(territory.id, "journalistsKilled", e.target.value === "" ? null : Number(e.target.value))}
                    className="w-full rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block font-medium text-neutral-600">Período dos jornalistas mortos</span>
                  <input
                    value={territory.journalistsKilledNote ?? ""}
                    onChange={(e) => updateField(territory.id, "journalistsKilledNote", e.target.value || null)}
                    placeholder="ex: desde 2022"
                    className="w-full rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  />
                </label>
                <label className="block text-xs sm:col-span-2">
                  <span className="mb-1 block font-medium text-neutral-600">Fonte dos números (ONU, CPJ, RSF...)</span>
                  <input
                    value={territory.statsSource ?? ""}
                    onChange={(e) => updateField(territory.id, "statsSource", e.target.value || null)}
                    className="w-full rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
                  />
                </label>
              </div>
            </details>

            <div className="mt-4 border-t border-neutral-100 pt-3 text-sm">
              <p className="mb-1 text-xs font-medium text-neutral-600">
                Notícias deste ponto
              </p>
              {territory.articles.length === 0 ? (
                <p className="text-xs text-neutral-400">
                  Nenhuma notícia vinculada — o ponto não aparece no mapa
                  até ter uma matéria publicada.
                </p>
              ) : (
                <ul className="space-y-1">
                  {territory.articles.map((a) => (
                    <li key={a.id} className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          a.published
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {a.published ? "Publicada" : "Rascunho"}
                      </span>
                      <span className="truncate text-neutral-800">{a.title}</span>
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="ml-auto shrink-0 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                      >
                        Editar notícia &rarr;
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
