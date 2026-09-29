"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReportDialog, { type ReportArticle } from "./ReportDialog";

/**
 * Leaflet mede o tamanho do container só na inicialização. Se o container
 * ainda não tinha seu tamanho final nesse momento (comum com dynamic
 * import + layout assíncrono), o mapa fica cortado até uma chamada manual
 * de invalidateSize().
 */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    invalidate();
    const timeout = setTimeout(invalidate, 200);
    window.addEventListener("resize", invalidate);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);
  return null;
}

export type LocationWithArticles = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  articles: ReportArticle[];
};

function createMarkerIcon(thumbnailUrl: string) {
  const safeUrl = thumbnailUrl.replace(/"/g, "&quot;");
  return L.divIcon({
    className: "map-marker",
    html: `<div class="map-marker-thumb"><img src="${safeUrl}" alt="" /></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

// Trava o mapa a uma única volta do mundo (sem repetição horizontal), que
// é a causa do bug em que marcadores "somem" ao rolar o mapa até ele dar
// a volta: a camada de tiles repete infinitamente, mas os marcadores são
// fixos numa única posição absoluta e não acompanham a cópia repetida.
const WORLD_BOUNDS = L.latLngBounds([-85, -180], [85, 180]);

export default function WorldMap({
  locations,
}: {
  locations: LocationWithArticles[];
}) {
  const [openLocation, setOpenLocation] = useState<LocationWithArticles | null>(
    null,
  );

  return (
    <>
      <style>{`
        .map-marker-thumb {
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          border: 2px solid #f5c94b;
          box-shadow: 0 0 0 3px rgba(245, 201, 75, 0.25), 0 2px 10px rgba(0,0,0,0.6);
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          cursor: pointer;
        }
        .map-marker-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .map-marker:hover .map-marker-thumb {
          transform: scale(1.7);
          box-shadow: 0 0 0 4px rgba(245, 201, 75, 0.4), 0 4px 16px rgba(0,0,0,0.7);
        }
      `}</style>

      <MapContainer
        center={[20, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={12}
        zoomSnap={0.5}
        wheelPxPerZoomLevel={90}
        scrollWheelZoom
        worldCopyJump={false}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%", background: "#0e1420" }}
      >
        <MapResizeHandler />
        {/* CARTO passou a exigir chave de API pra tiles; usamos o basemap
            escuro gratuito e sem chave da Esri (base + rótulos separados). */}
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          noWrap
        />
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          noWrap
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createMarkerIcon(location.articles[0].heroImageUrl)}
            eventHandlers={{
              click: () => setOpenLocation(location),
            }}
          />
        ))}
      </MapContainer>

      {openLocation && (
        <ReportDialog
          locationName={openLocation.name}
          articles={openLocation.articles}
          onClose={() => setOpenLocation(null)}
        />
      )}
    </>
  );
}
