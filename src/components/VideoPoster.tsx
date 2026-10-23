"use client";

import { useState } from "react";
import VideoModal from "./VideoModal";
import { getEmbedUrl } from "@/lib/video";

/** Capa grande com botão play que abre o vídeo (no minuto indicado). */
export default function VideoPoster({
  videoUrl,
  startSeconds,
  imageUrl,
  title,
}: {
  videoUrl: string;
  startSeconds?: number | null;
  imageUrl: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl, startSeconds);
  if (!embedUrl) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Assistir: ${title}`}
        className="group relative block aspect-video w-full overflow-hidden bg-neutral-900"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/50">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg sm:h-20 sm:w-20">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-black sm:h-8 sm:w-8">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>
      {open && <VideoModal embedUrl={embedUrl} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}
