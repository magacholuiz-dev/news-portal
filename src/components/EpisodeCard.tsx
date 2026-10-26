"use client";

import { useState } from "react";
import VideoModal from "./VideoModal";
import { getEmbedUrl, getVideoThumbnail } from "@/lib/video";

/** Cartão de um episódio: capa do YouTube, número, título, duração e botão
 * "Assistir" (abre o vídeo numa janela sobreposta). */
export default function EpisodeCard({
  number,
  title,
  duration,
  videoUrl,
}: {
  number: number;
  title: string;
  duration: string | null;
  videoUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);
  const thumb = getVideoThumbnail(videoUrl);
  if (!embedUrl) return null;
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Assistir episódio ${number}: ${title}`}
        className="group relative block aspect-video w-full overflow-hidden bg-neutral-800"
      >
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/20">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-400">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-amber-400"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </span>
      </button>
      <p className="mt-3 text-xs font-bold tracking-widest text-amber-400 uppercase">Episódio {number}</p>
      <h3 className="mt-1 font-serif text-xl leading-tight font-bold text-white">{title}</h3>
      {duration && <p className="mt-1 text-xs text-neutral-400">{duration}</p>}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-full border border-white/25 px-4 py-2 text-xs font-bold tracking-wide text-white uppercase transition-colors hover:border-amber-400 hover:text-amber-400"
      >
        Assistir
      </button>
      {open && <VideoModal embedUrl={embedUrl} title={title} onClose={() => setOpen(false)} />}
    </div>
  );
}
