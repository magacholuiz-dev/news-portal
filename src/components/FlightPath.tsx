"use client";

import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import * as turf from "@turf/turf";
import PassportCard, { type PassportCardData } from "./PassportCard";

export type RouteStop = PassportCardData & {
  lat: number;
  lng: number;
};

const ROUTE_SOURCE_FULL = "flight-route-full";
const ROUTE_SOURCE_TRAVELED = "flight-route-traveled";

/**
 * Seção 04 parte 1 (análise de dados — rota aérea): um mapa próprio
 * (instância MapLibre separada da de "Capítulos") com uma linha
 * tracejada ligando os 14 territórios na ordem de exibição da planilha.
 * Um marcador "avião" anda ao longo da rota (turf.along) conforme o
 * progresso contínuo de scroll da seção, e a parte já percorrida da
 * linha é redesenhada a cada tick (turf.lineSliceAlong). Ao lado, um
 * card de passaporte por território.
 */
export default function FlightPath({ stops }: { stops: RouteStop[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const planeMarkerRef = useRef<maptilersdk.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const routeLine =
    stops.length >= 2
      ? turf.lineString(stops.map((s) => [s.lng, s.lat]))
      : null;
  const totalLength = routeLine ? turf.length(routeLine) : 0;

  // Inicialização do mapa — mesmo padrão (espera container ter tamanho
  // real, maxBounds só depois do load, triggerRepaint duplo) já validado
  // em WorldMap.tsx pra evitar os bugs de canvas em branco já resolvidos
  // nesse projeto.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const container = containerRef.current;
    let cancelled = false;
    let rafId: number;

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
        center: [20, 15],
        zoom: 1.5,
        minZoom: 1,
        maxZoom: 8,
        navigationControl: false,
        geolocateControl: false,
      });
      mapRef.current = instance;

      instance.once("load", () => {
        instance.setMaxBounds([-179, -80, 179, 80]);

        if (routeLine) {
          instance.addSource(ROUTE_SOURCE_FULL, {
            type: "geojson",
            data: routeLine,
          });
          instance.addLayer({
            id: ROUTE_SOURCE_FULL,
            type: "line",
            source: ROUTE_SOURCE_FULL,
            paint: {
              "line-color": "#f5c94b",
              "line-width": 1.5,
              "line-opacity": 0.25,
              "line-dasharray": [1, 1.5],
            },
          });
          instance.addSource(ROUTE_SOURCE_TRAVELED, {
            type: "geojson",
            // GeoJSON LineString exige >= 2 posições; duplicar o primeiro
            // ponto dá uma linha de comprimento zero pra começar (nada
            // ainda percorrido), em vez de uma geometria inválida.
            data: turf.lineString([
              [stops[0].lng, stops[0].lat],
              [stops[0].lng, stops[0].lat],
            ]),
          });
          instance.addLayer({
            id: ROUTE_SOURCE_TRAVELED,
            type: "line",
            source: ROUTE_SOURCE_TRAVELED,
            paint: {
              "line-color": "#f5c94b",
              "line-width": 2.5,
              "line-opacity": 0.9,
            },
          });

          const planeEl = document.createElement("div");
          planeEl.className = "flight-plane-marker";
          planeEl.textContent = "✈";
          planeMarkerRef.current = new maptilersdk.Marker({ element: planeEl })
            .setLngLat([stops[0].lng, stops[0].lat])
            .addTo(instance);
        }

        instance.triggerRepaint();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => instance.triggerRepaint());
        });
        setMapReady(true);
      });

      const invalidate = () => {
        instance.resize();
        instance.triggerRepaint();
      };
      const timeout = setTimeout(invalidate, 200);
      window.addEventListener("resize", invalidate);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("resize", invalidate);
      };
    }

    rafId = requestAnimationFrame(waitForSizeAndInit);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progresso contínuo de scroll pela seção inteira (mesmo cálculo do
  // Hero): 0 no topo da seção, 1 no fim. Move o avião e redesenha o
  // trecho percorrido da rota a cada tick.
  useEffect(() => {
    if (!mapReady || !routeLine) return;
    const map = mapRef.current;
    if (!map) return;

    function handleScroll() {
      const el = wrapperRef.current;
      if (!el || !map) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));

      const distance = progress * totalLength;
      const point = turf.along(routeLine!, distance);
      const [lng, lat] = point.geometry.coordinates;
      planeMarkerRef.current?.setLngLat([lng, lat]);

      const firstCoord = routeLine!.geometry.coordinates[0];
      const traveled =
        distance > 0
          ? turf.lineSliceAlong(routeLine!, 0, distance)
          : turf.lineString([firstCoord, firstCoord]);
      const source = map.getSource(ROUTE_SOURCE_TRAVELED) as
        | maptilersdk.GeoJSONSource
        | undefined;
      source?.setData(traveled);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [mapReady, routeLine, totalLength]);

  if (stops.length === 0) return null;

  return (
    <div id="analise" ref={wrapperRef} className="relative scroll-mt-16 bg-neutral-950">
      <style>{`
        .flight-plane-marker {
          font-size: 22px;
          transform: rotate(45deg);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
        }
      `}</style>

      <div className="px-6 pt-20 pb-10 text-center sm:px-10">
        <p className="mb-2 text-xs font-bold tracking-widest text-amber-400 uppercase">
          Análise de dados
        </p>
        <h2 className="mx-auto max-w-2xl font-serif text-3xl font-black text-white sm:text-4xl">
          A rota de uma cobertura desigual
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400 sm:text-base">
          Role para acompanhar os 14 territórios do levantamento, na ordem em
          que entram no recorte do projeto — e o que cada um revela sobre
          acesso e risco para quem cobre esses lugares.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-5">
        <div className="sticky top-16 z-0 h-[45vh] w-full lg:col-span-3 lg:h-[calc(100vh-4rem)]">
          <div ref={containerRef} style={{ height: "100%", width: "100%", background: "#0e1420" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10 px-6 py-14 sm:px-10 lg:col-span-2">
          {stops.map((stop) => (
            <div key={stop.name} className="flex min-h-[40vh] w-full items-center justify-center">
              <PassportCard territory={stop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
