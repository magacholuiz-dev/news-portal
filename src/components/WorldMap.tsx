"use client";

import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import ReportDialog, { type ReportArticle } from "./ReportDialog";

export type LocationWithArticles = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  continent?: string | null;
  // Campos do recorte jornalístico (Seção 04/05) — opcionais, só
  // preenchidos depois que o seed real dos 14 territórios rodar.
  displayOrder?: number | null;
  coveragePct?: number | null;
  mediaAttentionClass?: string | null;
  journalistNote?: string | null;
  accessCategory?: string | null;
  riskLevelRSF?: string | null;
  articles: ReportArticle[];
};

export type MapFocusView = {
  center: [number, number];
  zoom: number;
};

// Trava o mapa a uma única volta do mundo (sem repetição horizontal), que
// é a causa do bug em que marcadores "somem" ao rolar o mapa até ele dar
// a volta: sem isso, a camada de tiles repete infinitamente, mas os
// marcadores ficam fixos numa única posição absoluta.
const WORLD_BOUNDS: maptilersdk.LngLatBoundsLike = [-179, -80, 179, 80];

function createMarkerElement(thumbnailUrl: string, isAnchor: boolean) {
  const el = document.createElement("div");
  el.className = `map-marker${isAnchor ? " map-marker--anchor" : ""}`;
  el.innerHTML = `<div class="map-marker-thumb"><img src="${thumbnailUrl.replace(/"/g, "&quot;")}" alt="" /></div>`;
  return el;
}

export default function WorldMap({
  locations,
  highlightContinent = null,
  focusView = null,
  selectedIds = null,
  onMarkerClick = null,
}: {
  locations: LocationWithArticles[];
  /** Quando definido, marcadores fora desse continente ficam esmaecidos
   * (efeito de "iluminação" da Seção 03/scrollytelling). `null` mostra
   * todos os marcadores com opacidade normal. */
  highlightContinent?: string | null;
  /** Quando muda, o mapa voa (flyTo) até esse enquadramento. */
  focusView?: MapFocusView | null;
  /** IDs de Location destacados com um anel diferente (modo comparação
   * da Seção 05). `null` não destaca nenhum. */
  selectedIds?: number[] | null;
  /** Quando definido, clicar num marcador chama isso em vez de abrir o
   * ReportDialog (usado pelo modo comparação da Seção 05). */
  onMarkerClick?: ((location: LocationWithArticles) => void) | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const [map, setMap] = useState<maptilersdk.Map | null>(null);
  const [openLocation, setOpenLocation] = useState<LocationWithArticles | null>(
    null,
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const container = containerRef.current;

    let cancelled = false;
    let rafId: number;
    let timeout: ReturnType<typeof setTimeout>;
    let invalidate: (() => void) | null = null;

    // O MapLibre calcula matrizes internas já na construção do mapa. Se o
    // container ainda estiver com largura/altura zero nesse instante
    // (comum logo após o dynamic import montar), essa conta pode quebrar
    // de um jeito que não se autocorrige depois. Por isso esperamos o
    // layout ter um tamanho real antes de criar o mapa.
    function waitForSizeAndInit() {
      if (cancelled) return;
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) {
        rafId = requestAnimationFrame(waitForSizeAndInit);
        return;
      }

      const instance = new maptilersdk.Map({
        container,
        apiKey: process.env.NEXT_PUBLIC_MAPTILER_KEY,
        style: maptilersdk.MapStyle.STREETS.DARK,
        language: maptilersdk.Language.ENGLISH,
        center: [10, 20],
        zoom: 1.3,
        minZoom: 1.3,
        maxZoom: 12,
        navigationControl: "top-left",
        geolocateControl: false,
      });
      mapRef.current = instance;

      // Aplicar maxBounds já na construção do mapa quebra o cálculo interno
      // do MapLibre; aplicar depois de carregado evita o problema e tem o
      // mesmo efeito prático de travar o mundo numa única volta.
      instance.once("load", () => {
        instance.setMaxBounds(WORLD_BOUNDS);
        setMap(instance);

        // Em alguns carregamentos o canvas WebGL fica em branco mesmo com
        // os tiles já baixados — falta um repaint que o próprio navegador
        // só dispara depois de um resize real. resize() não força nada se
        // o tamanho não mudou, então usamos triggerRepaint() (que sempre
        // agenda um novo frame) logo após o load e de novo em seguida via
        // requestAnimationFrame, garantindo que o primeiro frame pintado
        // aconteça depois do layout/paint real da página.
        instance.triggerRepaint();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => instance.triggerRepaint());
        });
      });

      invalidate = () => {
        instance.resize();
        instance.triggerRepaint();
      };
      timeout = setTimeout(invalidate, 200);
      window.addEventListener("resize", invalidate);
    }

    rafId = requestAnimationFrame(waitForSizeAndInit);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
      if (invalidate) window.removeEventListener("resize", invalidate);
      mapRef.current?.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    const markers = locations.map((location) => {
      const isAnchor = location.articles.some((a) => a.isAnchorEpisode);
      const el = createMarkerElement(location.articles[0].heroImageUrl, isAnchor);
      el.style.transition = "opacity 0.4s ease";
      if (selectedIds?.includes(location.id)) {
        el.classList.add("map-marker--selected");
      }
      el.addEventListener("click", () =>
        onMarkerClick ? onMarkerClick(location) : setOpenLocation(location),
      );
      const dimmed =
        highlightContinent !== null && location.continent !== highlightContinent;
      const marker = new maptilersdk.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map);
      // Setar `el.style.opacity` direto não gruda: o próprio Marker do
      // MapLibre reescreve isso no próprio ciclo de render (detecção de
      // oclusão em globe/terrain), via `setOpacity`/`_updateOpacity`. É
      // preciso usar a API do Marker pra o valor sobreviver aos repaints.
      marker.setOpacity(dimmed ? "0.25" : "1");
      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [map, locations, highlightContinent, selectedIds, onMarkerClick]);

  useEffect(() => {
    if (!map || !focusView) return;
    map.flyTo({
      center: focusView.center,
      zoom: focusView.zoom,
      duration: 1600,
      essential: true,
    });
  }, [map, focusView]);

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
        .map-marker--anchor .map-marker-thumb {
          width: 54px;
          height: 54px;
          border-width: 3px;
          border-color: #fff;
          box-shadow: 0 0 0 4px rgba(245, 201, 75, 0.55), 0 2px 14px rgba(0,0,0,0.7);
        }
        .map-marker--selected .map-marker-thumb {
          border-color: #22d3ee;
          box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.5), 0 2px 14px rgba(0,0,0,0.7);
        }
      `}</style>

      <div
        ref={containerRef}
        style={{ height: "100%", width: "100%", background: "#0e1420" }}
      />

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
