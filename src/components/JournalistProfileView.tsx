import Link from "next/link";
import type { getJournalistBySlug } from "@/lib/report";
import WorldMapLoader from "./WorldMapLoader";
import AudioClip from "./AudioClip";
import VideoButton from "./VideoButton";
import { quoteKindLabel } from "@/lib/quote-kinds";

type J = NonNullable<Awaited<ReturnType<typeof getJournalistBySlug>>>;

/** Perfil do entrevistado: foto, função, perfil, conflitos que cobriu,
 * galeria de fotos em campo e as falas dele (com áudio, quando houver). */
export default function JournalistProfileView({ journalist: j }: { journalist: J }) {
  return (
    <article className="px-5 pt-6 pb-12 sm:px-10 sm:pt-10">
      <header className="flex flex-col items-center gap-5 pb-10 text-center sm:flex-row sm:items-end sm:text-left">
        {j.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={j.photoUrl} alt={j.name} className="h-40 w-40 shrink-0 rounded-sm object-cover sm:h-48 sm:w-48" />
        ) : (
          <span className="flex h-40 w-40 shrink-0 items-center justify-center rounded-sm bg-neutral-800 font-serif text-5xl font-black text-neutral-500 sm:h-48 sm:w-48">{j.name.slice(0, 1)}</span>
        )}
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-amber-400 uppercase">{j.role ?? "Entrevistado"}</p>
          <h1 className="font-serif text-4xl leading-tight font-black sm:text-5xl">{j.name}</h1>
        </div>
      </header>

      {j.bio && (
        <section className="mx-auto max-w-2xl border-t border-white/10 py-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-neutral-500 uppercase">Perfil</p>
          <p className="text-lg leading-relaxed text-neutral-200">{j.bio}</p>
        </section>
      )}

      {j.places.length > 0 ? (
        <section className="border-t border-white/10 py-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-neutral-500 uppercase">Onde já fez reportagem</p>
          <p className="mb-4 font-serif text-2xl font-bold">
            {j.places.map((pl) => pl.label ?? pl.location.name).join(" · ")}
          </p>
          <div className="h-[320px] w-full overflow-hidden rounded-sm">
            <WorldMapLoader
              locations={j.places.map((pl) => ({
                id: pl.locationId,
                name: pl.label ?? pl.location.name,
                lat: pl.location.lat,
                lng: pl.location.lng,
                continent: pl.location.continent,
                articles: [],
              }))}
            />
          </div>
        </section>
      ) : (
        j.conflictsCovered && (
          <section className="border-t border-white/10 py-8">
            <p className="mb-3 text-xs font-bold tracking-widest text-neutral-500 uppercase">Conflitos que cobriu</p>
            <p className="font-serif text-2xl font-bold">{j.conflictsCovered}</p>
          </section>
        )
      )}

      {j.photos.length > 0 && (
        <section className="border-t border-white/10 py-8">
          <p className="mb-4 text-xs font-bold tracking-widest text-neutral-500 uppercase">Em campo</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {j.photos.map((p) => (
              <figure key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.caption ?? j.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <figcaption className="mt-1 text-[11px] text-neutral-500">
                  {p.caption ?? p.location?.name ?? ""}
                  {p.credit && <> · {p.credit}</>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {j.quotes.length > 0 && (
        <section className="border-t border-white/10 py-8">
          <p className="mb-5 text-xs font-bold tracking-widest text-neutral-500 uppercase">Falas</p>
          <ul className="space-y-5">
            {j.quotes.map((q) => (
              <li key={q.id} className="border-l-2 border-amber-400/60 pl-4">
                <p className="text-lg leading-snug text-neutral-100">&ldquo;{q.text}&rdquo;</p>
                <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span>{q.location?.name ?? quoteKindLabel(q.kind)}</span>
                  {q.audioUrl && <AudioClip src={q.audioUrl} />}
                  {q.videoUrl && <VideoButton videoUrl={q.videoUrl} startSeconds={q.videoStartSeconds} title={j.name} label="Ver no vídeo" />}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="border-t border-white/10 pt-6 text-xs text-neutral-600">
        <Link href="/#entrevistados" className="hover:text-amber-400">&larr; Todos os entrevistados</Link>
      </p>
    </article>
  );
}
