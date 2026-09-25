"use client";

import dynamic from "next/dynamic";
import type { LocationWithArticles } from "./WorldMap";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
      Carregando mapa...
    </div>
  ),
});

export default function WorldMapLoader({
  locations,
}: {
  locations: LocationWithArticles[];
}) {
  return <WorldMap locations={locations} />;
}
