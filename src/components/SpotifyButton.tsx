"use client";

import { useState } from "react";
import { getSpotifyEmbedUrl } from "@/lib/spotify";

/** Botão "Ouvir a entrevista no Spotify": o player só carrega no clique. */
export default function SpotifyButton({
  spotifyUrl,
  title,
  className = "",
}: {
  spotifyUrl: string;
  title: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const embed = getSpotifyEmbedUrl(spotifyUrl);
  if (!embed) return null;
  if (open) {
    return (
      <iframe
        src={embed}
        title={title}
        width="100%"
        height="152"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className={`rounded-xl border-0 ${className}`}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`inline-flex items-center gap-2 rounded-sm border border-amber-400/60 px-3 py-1.5 text-xs font-bold tracking-wide text-amber-400 uppercase transition-colors hover:bg-amber-400/10 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M8 5v14l11-7z" /></svg>
      Ouvir a entrevista no Spotify
    </button>
  );
}
