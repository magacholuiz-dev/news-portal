"use client";

import dynamic from "next/dynamic";
import type { LocationWithArticles, MapFocusView } from "./WorldMap";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-neutral-900 text-sm text-neutral-400">
      Carregando mapa...
    </div>
  ),
});

export default function WorldMapLoader({
  locations,
  highlightContinent = null,
  focusView = null,
}: {
  locations: LocationWithArticles[];
  highlightContinent?: string | null;
  focusView?: MapFocusView | null;
}) {
  return (
    <WorldMap
      locations={locations}
      highlightContinent={highlightContinent}
      focusView={focusView}
    />
  );
}
