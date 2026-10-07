"use client";

import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import PassportCard, { type PassportCardData } from "./PassportCard";
import { useScrollSteps } from "@/hooks/useScrollSteps";

export type RouteStop = PassportCardData & {
  lat: number;
  lng: number;
};

type BeamPoint = { key: string; x: number; y: number };

/**
 * Seção 04 parte 1 (análise de dados): um mapa próprio (instância
 * MapLibre separada da de "Capítulos") onde cada um dos 14 territórios
 * "acende" — um facho de luz sobe do marcador em direção ao topo do
 * mapa — conforme o card dele fica ativo no scroll (mesmo motor
 * `useScrollSteps` do ChapterScroll, baseado em IntersectionObserver).
 * As luzes se acumulam: uma vez acesa, a do território anterior
 * continua visível enquanto rola pros próximos.
 */
export default function FlightPath({ stops }: { stops: RouteStop[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const [map, setMap] = useState<maptilersdk.Map | null>(null);
  const [beams, setBeams] = useState<BeamPoint[]>([]);

  const { activeStep, setStepRef } = useScrollSteps(stops.length);

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
        instance.triggerRepaint();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => instance.triggerRepaint());
        });
        setMap(instance);
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
      setMap(null);
    };
  }, []);

  // Reprojeta a posição em tela de cada território já "aceso" (índice
  // <= activeStep) sempre que o mapa se move ou o passo ativo muda —
  // mesma técnica do facho de luz do ChapterScroll (map.project), só
  // que aqui acumula vários pontos em vez de um só.
  useEffect(() => {
    if (!map) return;

    function updateBeams() {
      if (!map) return;
      const lit = stops.slice(0, activeStep + 1).map((stop, i) => {
        const point = map.project([stop.lng, stop.lat]);
        return { key: `${i}-${stop.name}`, x: point.x, y: point.y };
      });
      setBeams(lit);
    }

    updateBeams();
    map.on("move", updateBeams);
    return () => {
      map.off("move", updateBeams);
    };
  }, [map, activeStep, stops]);

  if (stops.length === 0) return null;

  return (
    <div id="analise" className="relative scroll-mt-16 bg-neutral-950">
      <style>{`
        .flight-beam {
          background: linear-gradient(
            to top,
            rgba(245, 201, 75, 0.9) 0%,
            rgba(245, 201, 75, 0.35) 40%,
            rgba(245, 201, 75, 0) 100%
          );
          animation: flightBeamIn 0.9s ease-out;
        }
        @keyframes flightBeamIn {
          from {
            opacity: 0;
            transform: scaleY(0.2);
            transform-origin: bottom;
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      `}</style>

      <div className="px-6 pt-20 pb-10 text-center sm:px-10">
        <p className="mb-2 text-xs font-bold tracking-widest text-amber-400 uppercase">
          Análise de dados
        </p>
        <h2 className="mx-auto max-w-2xl font-serif text-3xl font-black text-white sm:text-4xl">
          Luzes sobre uma cobertura desigual
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400 sm:text-base">
          Role para acompanhar os 14 territórios do levantamento, na ordem em
          que entram no recorte do projeto — cada um acende no mapa conforme
          aparece — e o que cada um revela sobre acesso e risco para quem
          cobre esses lugares.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-5">
        <div className="sticky top-16 z-20 h-[45vh] w-full overflow-hidden lg:z-0 lg:col-span-3 lg:h-[calc(100vh-4rem)]">
          <div style={{ position: "relative", height: "100%", width: "100%" }}>
            <div
              ref={containerRef}
              style={{ height: "100%", width: "100%", background: "#0e1420" }}
            />
            {beams.map((beam) => (
              <div
                key={beam.key}
                className="flight-beam"
                style={{
                  position: "absolute",
                  left: beam.x - 2,
                  top: 0,
                  width: 4,
                  height: Math.max(0, beam.y),
                  pointerEvents: "none",
                }}
              />
            ))}
            {beams.map((beam) => (
              <div
                key={`glow-${beam.key}`}
                style={{
                  position: "absolute",
                  left: beam.x - 7,
                  top: beam.y - 7,
                  width: 14,
                  height: 14,
                  borderRadius: "9999px",
                  pointerEvents: "none",
                  background:
                    "radial-gradient(circle, rgba(255,239,189,1) 0%, rgba(245,201,75,0.65) 45%, rgba(245,201,75,0) 75%)",
                  boxShadow: "0 0 14px 4px rgba(245,201,75,0.55)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10 px-6 py-14 sm:px-10 lg:col-span-2">
          {stops.map((stop, index) => (
            <div
              key={stop.name}
              ref={setStepRef(index)}
              className="flex min-h-[40vh] w-full items-center justify-center"
            >
              <PassportCard territory={stop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
