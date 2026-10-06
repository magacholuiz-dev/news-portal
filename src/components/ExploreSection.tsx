"use client";

import { useMemo, useState } from "react";
import type { LocationWithArticles } from "./WorldMap";
import WorldMapLoader from "./WorldMapLoader";
import PassportCard from "./PassportCard";

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

// Seção 05 (exploração livre): o mesmo mapa, mas sem roteiro fixo — filtro
// por continente/categoria de acesso e um modo de comparação que deixa
// escolher até 2 territórios pra ver lado a lado (reaproveita PassportCard).
export default function ExploreSection({
  locations,
}: {
  locations: LocationWithArticles[];
}) {
  const [continentFilter, setContinentFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selected, setSelected] = useState<LocationWithArticles[]>([]);

  const filtered = useMemo(() => {
    return locations.filter((location) => {
      if (continentFilter && location.continent !== continentFilter) return false;
      if (accessFilter && location.accessCategory !== accessFilter) return false;
      return true;
    });
  }, [locations, continentFilter, accessFilter]);

  function toggleSelection(location: LocationWithArticles) {
    setSelected((prev) => {
      const exists = prev.some((l) => l.id === location.id);
      if (exists) return prev.filter((l) => l.id !== location.id);
      if (prev.length >= 2) return [prev[1], location];
      return [...prev, location];
    });
  }

  return (
    <div id="explorar" className="scroll-mt-16 border-t border-white/10 bg-neutral-950">
      <div className="px-6 pt-16 pb-8 text-center sm:px-10">
        <p className="mb-2 text-xs font-bold tracking-widest text-amber-400 uppercase">
          Explorar
        </p>
        <h2 className="mx-auto max-w-2xl font-serif text-3xl font-black text-white sm:text-4xl">
          Filtre e compare os territórios
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400">
          Sem roteiro fixo: filtre por continente ou categoria de acesso, ou
          ative o modo comparação e escolha até dois territórios pra ver
          lado a lado.
        </p>
      </div>

      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-6 pb-8 sm:px-10">
        <select
          value={continentFilter}
          onChange={(e) => setContinentFilter(e.target.value)}
          className="rounded-sm border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
        >
          <option value="">Todos os continentes</option>
          {CONTINENT_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className="rounded-sm border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
        >
          <option value="">Toda categoria de acesso</option>
          {ACCESS_CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setComparisonMode((v) => !v);
            setSelected([]);
          }}
          className={`rounded-sm border px-3 py-2 text-sm font-semibold transition-colors ${
            comparisonMode
              ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
              : "border-white/15 text-neutral-300 hover:bg-white/5"
          }`}
        >
          {comparisonMode ? "Modo comparação: ativo" : "Ativar modo comparação"}
        </button>
      </div>

      {comparisonMode && (
        <p className="mb-6 text-center text-xs text-neutral-500">
          {selected.length === 0 && "Clique em até 2 marcadores no mapa pra comparar."}
          {selected.length === 1 && "Escolha mais um território pra comparar."}
          {selected.length === 2 && "Clique em outro marcador pra trocar a comparação."}
        </p>
      )}

      <div className="h-[60vh] min-h-[420px] w-full">
        <WorldMapLoader
          locations={filtered}
          selectedIds={comparisonMode ? selected.map((l) => l.id) : null}
          onMarkerClick={comparisonMode ? toggleSelection : null}
        />
      </div>

      {comparisonMode && selected.length === 2 && (
        <div className="flex flex-wrap justify-center gap-6 px-6 py-12 sm:px-10">
          {selected.map((location) => (
            <PassportCard
              key={location.id}
              territory={{
                name: location.name,
                displayOrder: location.displayOrder ?? null,
                coveragePct: location.coveragePct ?? null,
                mediaAttentionClass: location.mediaAttentionClass ?? null,
                journalistNote: location.journalistNote ?? null,
                accessCategory: location.accessCategory ?? null,
                riskLevelRSF: location.riskLevelRSF ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
