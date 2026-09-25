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
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          overflow: hidden;
          transition: transform 0.15s ease;
          cursor: pointer;
        }
        .map-marker-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .map-marker:hover .map-marker-thumb {
          transform: scale(1.6);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
      `}</style>

      <MapContainer
        center={[20, 10]}
        zoom={2}
        minZoom={2}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapResizeHandler />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
