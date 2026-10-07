"use client";

import type { LocationWithArticles, MapFocusView } from "./WorldMap";
import WorldMapLoader from "./WorldMapLoader";
import { useScrollSteps } from "@/hooks/useScrollSteps";

export type Chapter = {
  continent: string;
  title: string;
  body: string;
  focusView: MapFocusView;
};

// Seção 03 do briefing: 5 capítulos, um por continente/região coberta
// pelo projeto. O enquadramento (focusView) é aproximado — cobre os
// territórios daquela região sem precisar de fronteiras GeoJSON.
export const CHAPTERS: Chapter[] = [
  {
    continent: "Europa",
    title: "Europa: o conflito no centro da agenda global",
    body: "A guerra na Ucrânia concentra a maior cobertura internacional dentre os 14 territórios analisados neste projeto — uma cobertura hipervisível, sustentada por uma presença massiva de imprensa internacional desde 2022.",
    focusView: { center: [31, 49], zoom: 4.2 },
  },
  {
    continent: "Asia e Oriente Medio",
    title: "Ásia e Oriente Médio: oito frentes, uma única região",
    body: "Gaza, Israel, Líbano, Síria, Irã, Cisjordânia, Iêmen e Mianmar dividem a mesma região e níveis de cobertura radicalmente diferentes — de hipercobertura sob risco extremo a guerras quase silenciadas pela imprensa internacional.",
    focusView: { center: [45, 28], zoom: 2.6 },
  },
  {
    continent: "Africa",
    title: "África: a crise que o mundo decidiu não ver",
    body: "Sudão vive uma das maiores crises humanitárias da atualidade com baixíssima visibilidade nos grandes veículos ocidentais. Ao lado, a Líbia soma cobertura esporádica, quase sempre associada a crises migratórias no Mediterrâneo.",
    focusView: { center: [24, 14], zoom: 3 },
  },
  {
    continent: "Americas",
    title: "Américas: direitos humanos fora do radar",
    body: "Cuba e México aparecem no recorte por episódios pontuais — repressão a protestos, êxodo migratório, violência extrema contra jornalistas — mais do que por cobertura contínua.",
    focusView: { center: [-90, 18], zoom: 2.8 },
  },
  {
    continent: "Oceania",
    title: "Oceania: a zona de sombra mais extrema do mapa",
    body: "Papua-Nova Guiné é o território com menor cobertura midiática de todo o levantamento: silêncio quase total da imprensa internacional sobre disputas locais e regionais.",
    focusView: { center: [147, -8], zoom: 4.2 },
  },
];

export default function ChapterScroll({
  locations,
}: {
  locations: LocationWithArticles[];
}) {
  const { activeStep, setStepRef } = useScrollSteps(CHAPTERS.length);
  const chapter = CHAPTERS[activeStep];

  // Destaque (facho de luz) no território-âncora do continente ativo —
  // ex.: Ucrânia na Europa. Na falta de um âncora marcado (continente
  // ainda sem isAnchorEpisode definido), cai pro primeiro território
  // daquele continente, pra sempre ter algo iluminado.
  const regionLocations = locations.filter((l) => l.continent === chapter.continent);
  const spotlightLocation =
    regionLocations.find((l) => l.articles.some((a) => a.isAnchorEpisode)) ??
    regionLocations[0] ??
    null;

  return (
    <div id="capitulos" className="relative scroll-mt-16 bg-neutral-950">
      <div className="lg:grid lg:grid-cols-5">
        <div className="sticky top-16 z-0 h-[45vh] w-full lg:col-span-3 lg:h-[calc(100vh-4rem)]">
          <WorldMapLoader
            locations={locations}
            highlightContinent={chapter.continent}
            focusView={chapter.focusView}
            spotlightTarget={
              spotlightLocation
                ? { lat: spotlightLocation.lat, lng: spotlightLocation.lng }
                : null
            }
          />
        </div>

        <div className="relative z-10 lg:col-span-2">
          {CHAPTERS.map((step, index) => (
            <div
              key={step.continent}
              ref={setStepRef(index)}
              className="flex min-h-[60vh] items-center px-6 py-14 sm:px-10 lg:min-h-screen"
            >
              <div>
                <p className="mb-3 text-xs font-bold tracking-widest text-amber-400 uppercase">
                  Capítulo {index + 1} de {CHAPTERS.length}
                </p>
                <h3 className="font-serif text-2xl leading-tight font-black text-white sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
