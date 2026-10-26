"use client";

import { useEffect, useRef, useState } from "react";

export type HeroVideoSources = {
  mp4: string;
  webm: string;
  mobileMp4: string;
  mobileWebm: string;
  poster: string;
};

/**
 * Vídeo de fundo da abertura (tela cheia, sem som, em loop, inclusive no
 * celular). Usa arquivos MP4/WebM — nunca o player do YouTube. Mostra só a
 * imagem de capa enquanto carrega e quando o visitante prefere menos
 * movimento, está economizando dados ou numa conexão lenta; pausa quando a
 * seção sai da tela ou é coberta pela 2ª frase.
 */
export default function HeroVideo({
  sources,
  active,
}: {
  sources: HeroVideoSources;
  /** false quando a abertura já foi coberta (2ª frase) — pausa o vídeo. */
  active: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<{ webm: string; mp4: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  const hasAny = Boolean(sources.mp4 || sources.webm || sources.mobileMp4 || sources.mobileWebm);

  // Decide se carrega o vídeo e qual versão (desktop ou mobile).
  useEffect(() => {
    if (!hasAny) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = Boolean(conn?.saveData) || /(^|-)2g$/.test(conn?.effectiveType ?? "");
    if (reduce || slow) return;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const webm = (mobile ? sources.mobileWebm || sources.webm : sources.webm || sources.mobileWebm) || "";
    const mp4 = (mobile ? sources.mobileMp4 || sources.mp4 : sources.mp4 || sources.mobileMp4) || "";
    setSrc({ webm, mp4 });
  }, [hasAny, sources]);

  // Pausa quando a seção não está visível.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    if (visible && active) {
      video.play().catch(() => {
        /* autoplay bloqueado: fica a imagem de capa */
      });
    } else {
      video.pause();
    }
  }, [visible, active, src, ready]);

  if (!hasAny && !sources.poster) return null;

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" aria-hidden>
      {sources.poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sources.poster}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {src && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={sources.poster || undefined}
          onCanPlay={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          {src.webm && <source src={src.webm} type="video/webm" />}
          {src.mp4 && <source src={src.mp4} type="video/mp4" />}
        </video>
      )}
      {/* Camada escura: garante a leitura das frases sobre qualquer vídeo. */}
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}
