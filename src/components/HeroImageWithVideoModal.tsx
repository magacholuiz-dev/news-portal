"use client";

import { useState } from "react";
import VideoModal from "./VideoModal";
import { getEmbedUrl } from "@/lib/video";

export default function HeroImageWithVideoModal({
  imageUrl,
  videoUrl,
  alt,
}: {
  imageUrl: string;
  videoUrl?: string | null;
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
    <>
      <button
        type="button"
        disabled={!embedUrl}
        onClick={() => embedUrl && setOpen(true)}
        className={`group relative block w-full overflow-hidden bg-neutral-900 ${
          embedUrl ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {embedUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
              <svg
                viewBox="0 0 24 24"
                className="ml-1 h-7 w-7 fill-black sm:h-8 sm:w-8"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        )}
      </button>
      {open && embedUrl && (
        <VideoModal
          embedUrl={embedUrl}
          title={alt}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
