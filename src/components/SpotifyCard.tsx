"use client";

import { useState } from "react";
import { getSpotifyEmbedUrl } from "@/lib/spotify";

/** Cartão de entrevista em áudio: o player do Spotify só carrega depois do
 * clique, pra não pesar a página com vários iframes. */
export default function SpotifyCard({
  name,
  role,
  photoUrl,
  spotifyUrl,
}: {
  name: string;
  role: string | null;
  photoUrl: string | null;
  spotifyUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const embed = getSpotifyEmbedUrl(spotifyUrl);
  if (!embed) return null;
  return (
    <div className="border border-white/10 p-3">
      <div className="flex items-center gap-3">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover object-top" loading="lazy" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 font-serif text-xl font-black text-neutral-500">
            {name.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-base leading-tight font-bold text-white">{name}</p>
          {role && <p className="line-clamp-2 text-[11px] leading-snug text-neutral-400">{role}</p>}
        </div>
      </div>
      {open ? (
        <iframe
          src={embed}
          title={`Entrevista com ${name} no Spotify`}
          width="100%"
          height="152"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="mt-3 rounded-xl border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-amber-400/60 px-3 py-2 text-xs font-bold tracking-wide text-amber-400 uppercase transition-colors hover:bg-amber-400/10"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M8 5v14l11-7z" /></svg>
          Ouvir a entrevista
        </button>
      )}
    </div>
  );
}
