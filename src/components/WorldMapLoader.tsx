"use client";

import dynamic from "next/dynamic";
import type { LocationWithArticles, MapFocusView, SpotlightTarget } from "./WorldMap";

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
  selectedIds = null,
  onMarkerClick = null,
  spotlightTarget = null,
}: {
  locations: LocationWithArticles[];
  highlightContinent?: string | null;
  focusView?: MapFocusView | null;
  selectedIds?: number[] | null;
  onMarkerClick?: ((location: LocationWithArticles) => void) | null;
  spotlightTarget?: SpotlightTarget | null;
}) {
  return (
    <WorldMap
      locations={locations}
      highlightContinent={highlightContinent}
      focusView={focusView}
      selectedIds={selectedIds}
      onMarkerClick={onMarkerClick}
      spotlightTarget={spotlightTarget}
    />
  );
}
