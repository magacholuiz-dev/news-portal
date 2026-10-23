"use client";

import { useEffect, useRef, useState } from "react";

/** Botão de áudio curto (mini podcast / "quem esteve lá"). Só um áudio
 * toca por vez na página. */
export default function AudioClip({
  src,
  label = "Ouvir",
}: {
  src: string;
  label?: string;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    return () => el?.pause();
  }, []);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      document.querySelectorAll<HTMLAudioElement>("audio[data-clip]").forEach((a) => {
        if (a !== el) a.pause();
      });
      void el.play();
    } else {
      el.pause();
    }
  }

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar áudio" : label}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
          {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
        </svg>
        {playing ? "Pausar" : label}
      </button>
      <audio
        ref={ref}
        data-clip
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </span>
  );
}
