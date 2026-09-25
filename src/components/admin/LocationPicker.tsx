"use client";

import { useState } from "react";

export type LocationValue = { name: string; lat: number; lng: number };

type SearchResult = { name: string; lat: number; lng: number };

export default function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch(
        `/api/admin/geocode?q=${encodeURIComponent(query.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao buscar localização.");
        return;
      }
      if (data.results.length === 0) {
        setError("Nenhum local encontrado. Tente refinar a busca.");
      }
      setResults(data.results);
    } catch {
      setError("Falha ao buscar localização.");
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm">
        <div>
          <p className="font-medium text-neutral-800">{value.name}</p>
          <p className="text-xs text-neutral-500">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Trocar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nome da cidade ou país (ex: Kiev, Ucrânia)"
          className="flex-1 rounded-sm border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="rounded-sm border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {searching ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-neutral-100 rounded-sm border border-neutral-200">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => {
                  onChange(result);
                  setResults([]);
                  setQuery("");
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
              >
                {result.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
