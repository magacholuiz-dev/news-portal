"use client";

import { useState } from "react";
import VideoModal from "./VideoModal";
import { getEmbedUrl } from "@/lib/video";
import { formatTimecode } from "@/lib/time";

/** Botão que abre o vídeo numa janela sobreposta, já no minuto da fala. */
export default function VideoButton({
  videoUrl,
  startSeconds,
  title,
  label,
  className = "",
}: {
  videoUrl: string;
  startSeconds?: number | null;
  title: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl, startSeconds);
  if (!embedUrl) return null;
  const at = startSeconds ? ` (${formatTimecode(startSeconds)})` : "";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-sm border border-amber-400/60 px-3 py-1.5 text-xs font-bold tracking-wide text-amber-400 uppercase transition-colors hover:bg-amber-400/10 ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
          <path d="M8 5v14l11-7z" />
        </svg>
        {label ?? `Assistir no vídeo${at}`}
      </button>
      {open && (
        <VideoModal
          embedUrl={embedUrl}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
