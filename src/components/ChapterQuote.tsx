import type { QuoteDTO } from "@/lib/public-types";
import VideoButton from "./VideoButton";

/** Aspa grande do capítulo: foto do jornalista, fala e botão que abre o
 * vídeo no minuto. Sem jornalista vira o "quadro de aspas vazio" (ex.:
 * Oceania — nenhum entrevistado esteve lá). */
export default function ChapterQuote({
  quote,
  chapterTitle,
}: {
  quote: QuoteDTO;
  chapterTitle: string;
}) {
  const empty = !quote.journalistName;
  return (
    <figure
      className={`mt-8 ${
        empty
          ? "rounded-sm border-2 border-dashed border-white/25 px-5 py-8 text-center"
          : "border-l-2 border-amber-400/70 pl-5"
      }`}
    >
      <blockquote
        className={`font-serif leading-snug font-bold text-white ${
          empty ? "text-xl sm:text-2xl" : "text-xl sm:text-2xl"
        }`}
      >
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      {!empty && (
        <figcaption className="mt-4 flex flex-wrap items-center gap-3">
          {quote.journalistPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={quote.journalistPhoto}
              alt={quote.journalistName ?? ""}
              className="h-12 w-12 rounded-full border border-white/20 object-cover"
            />
          ) : null}
          <span className="text-sm font-semibold text-neutral-200">
            {quote.journalistName}
          </span>
          {quote.videoUrl && (
            <VideoButton
              videoUrl={quote.videoUrl}
              startSeconds={quote.videoStartSeconds}
              title={`${quote.journalistName} — ${chapterTitle}`}
              label="Assistir no minuto da fala"
            />
          )}
        </figcaption>
      )}
    </figure>
  );
}
