import Link from "next/link";
import type { ReportData } from "@/lib/report";
import { Stamp } from "./PassportCard";
import VideoPoster from "./VideoPoster";
import VideoButton from "./VideoButton";
import AudioClip from "./AudioClip";
import type { QuoteDTO } from "@/lib/public-types";

function Avatar({ name, photo, size = 56 }: { name: string; photo: string | null; size?: number }) {
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt={name} width={size} height={size} style={{ width: size, height: size }} className="shrink-0 rounded-full border border-white/20 object-cover" />
  ) : (
    <span style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-neutral-800 text-sm font-bold text-neutral-400">
      {name.slice(0, 1)}
    </span>
  );
}

function JournalistName({ q }: { q: QuoteDTO }) {
  if (!q.journalistName) return null;
  return q.journalistSlug ? (
    <Link href={`/entrevistados/${q.journalistSlug}`} scroll={false} className="font-semibold text-white hover:text-amber-400">
      {q.journalistName}
    </Link>
  ) : (
    <span className="font-semibold text-white">{q.journalistName}</span>
  );
}

/** Reportagem de um território no modelo de 7 blocos (entrada, fala,
 * conflito em um parágrafo, vídeo, "como é cobrir aqui", galeria e mini
 * podcast). Cada bloco só aparece quando tem conteúdo, e o formato muda a
 * cada tela (texto grande, aspas, parágrafo, vídeo, infográfico, fotos,
 * áudio). */
export default function ReportView({ report }: { report: ReportData }) {
  const { article, location, fala, cobertura, podcast, photos } = report;
  if (!location) return null;

  const hasInfographic =
    location.accessCategory || location.riskLevelRSF || location.journalistsKilled != null;

  return (
    <article className="px-5 pt-6 pb-12 sm:px-10 sm:pt-10">
      {/* 1 · Entrada */}
      <header className="pb-10 text-center sm:pb-14 sm:text-left">
        <p className="mb-3 text-xs font-bold tracking-widest text-amber-400 uppercase">{location.name}</p>
        <h1 className="font-serif text-4xl leading-[1.05] font-black sm:text-6xl">{article.title}</h1>
        {location.entryPhrase && (
          <p className="mt-4 max-w-2xl text-xl text-neutral-300 sm:text-2xl">{location.entryPhrase}</p>
        )}
        {location.victimsNumber && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="font-serif text-6xl font-black text-amber-400 sm:text-8xl">{location.victimsNumber}</p>
            {location.victimsLabel && <p className="mt-1 text-sm tracking-wide text-neutral-300 uppercase">{location.victimsLabel}</p>}
            {location.statsSource && <p className="mt-1 text-xs text-neutral-500">Fonte: {location.statsSource}</p>}
          </div>
        )}
      </header>

      {/* 2 · A fala */}
      {fala && (
        <blockquote className="my-2 border-y border-white/10 py-10 sm:py-14">
          <p className="font-serif text-2xl leading-snug font-bold sm:text-4xl">&ldquo;{fala.text}&rdquo;</p>
          <footer className="mt-6 flex flex-wrap items-center gap-4">
            {fala.journalistName && <Avatar name={fala.journalistName} photo={fala.journalistPhoto} size={64} />}
            <div className="text-sm">
              <JournalistName q={fala} />
            </div>
            {fala.videoUrl && (
              <VideoButton videoUrl={fala.videoUrl} startSeconds={fala.videoStartSeconds} title={`${fala.journalistName ?? "Fala"} — ${article.title}`} className="ml-auto" />
            )}
          </footer>
        </blockquote>
      )}

      {/* 3 · O conflito em um parágrafo */}
      {location.conflictSummary && (
        <section className="mx-auto max-w-2xl py-10 sm:py-14">
          <p className="mb-3 text-xs font-bold tracking-widest text-neutral-500 uppercase">O conflito em um parágrafo</p>
          <p className="text-lg leading-relaxed text-neutral-200 sm:text-xl">{location.conflictSummary}</p>
        </section>
      )}

      {/* 4 · O vídeo */}
      {article.videoUrl && (
        <section className="py-4 sm:py-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-neutral-500 uppercase">O vídeo</p>
          <VideoPoster videoUrl={article.videoUrl} startSeconds={article.videoStartSeconds} imageUrl={article.heroImageUrl} title={article.title} />
        </section>
      )}

      {/* 5 · Como é cobrir aqui */}
      {(hasInfographic || cobertura.length > 0) && (
        <section className="py-10 sm:py-14">
          <p className="mb-5 text-xs font-bold tracking-widest text-neutral-500 uppercase">Como é cobrir aqui</p>
          {hasInfographic && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border border-white/10 p-5">
                <p className="text-xs text-neutral-500 uppercase">Acesso</p>
                <div className="mt-3"><Stamp accessCategory={location.accessCategory} /></div>
              </div>
              <div className="border border-white/10 p-5">
                <p className="text-xs text-neutral-500 uppercase">Risco (RSF)</p>
                <p className="mt-2 font-serif text-3xl font-black">{location.riskLevelRSF ?? "—"}</p>
              </div>
              <div className="border border-white/10 p-5">
                <p className="text-xs text-neutral-500 uppercase">Jornalistas mortos</p>
                <p className="mt-2 font-serif text-3xl font-black text-amber-400">{location.journalistsKilled ?? "—"}</p>
                {location.journalistsKilledNote && <p className="text-xs text-neutral-500">{location.journalistsKilledNote}</p>}
              </div>
            </div>
          )}
          {cobertura.length > 0 && (
            <ul className="mt-6 space-y-5">
              {cobertura.map((q) => (
                <li key={q.id} className="flex gap-4">
                  {q.journalistName && <Avatar name={q.journalistName} photo={q.journalistPhoto} size={44} />}
                  <div>
                    <p className="text-lg leading-snug text-neutral-100">&ldquo;{q.text}&rdquo;</p>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      <JournalistName q={q} />
                      {q.videoUrl && <VideoButton videoUrl={q.videoUrl} startSeconds={q.videoStartSeconds} title={q.journalistName ?? "Fala"} label="Ver no vídeo" />}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 6 · Galeria */}
      {photos.length > 0 && (
        <section className="py-6 sm:py-10">
          <p className="mb-4 text-xs font-bold tracking-widest text-neutral-500 uppercase">Galeria</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p) => (
              <figure key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.caption ?? p.journalistName} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <figcaption className="mt-1 text-[11px] text-neutral-500">
                  {p.caption ?? p.journalistName}
                  {p.credit && <> · {p.credit}</>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* 7 · Mini podcast */}
      {podcast.length > 0 && (
        <section className="py-10 sm:py-14">
          <p className="mb-5 text-xs font-bold tracking-widest text-neutral-500 uppercase">Mini podcast</p>
          <ul className="space-y-4">
            {podcast.map((q) => (
              <li key={q.id} className="flex items-center gap-4 border border-white/10 p-4">
                {q.journalistName && <Avatar name={q.journalistName} photo={q.journalistPhoto} size={48} />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-200">{q.text}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{q.journalistName}</p>
                </div>
                {q.audioUrl && <AudioClip src={q.audioUrl} />}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
