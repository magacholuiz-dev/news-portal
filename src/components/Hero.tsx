"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Seção 01 (abertura imersiva): tela cheia escura com duas frases do
 * briefing que se alternam conforme o usuário rola — a primeira frase
 * sai de cena e a segunda entra antes da seção soltar o scroll e seguir
 * pro mapa (Seção 02/03, "Capítulos"). Sem lib de scrollytelling: só
 * progresso de scroll dentro de um container 2x a altura da tela.
 */
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const scrolled = -rect.top;
      const p = Math.min(1, Math.max(0, scrolled / total));
      setProgress(p);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Frase 1 visível até 45% do scroll da seção, crossfade até 60%,
  // frase 2 assume de 60% a 100%.
  const phrase1Opacity = progress < 0.45 ? 1 : Math.max(0, 1 - (progress - 0.45) / 0.15);
  const phrase2Opacity = progress > 0.6 ? Math.min(1, (progress - 0.6) / 0.2) : 0;
  const phrase1Shift = Math.min(1, progress / 0.45) * -24;
  const phrase2Shift = (1 - Math.min(1, Math.max(0, (progress - 0.6) / 0.2))) * 24;

  return (
    <div id="hero" ref={containerRef} className="relative h-[200vh] scroll-mt-16">
      <div className="sticky top-0 h-screen w-full bg-neutral-950">
        {/* Fundo escuro atmosférico com fade-in suave no carregamento (uma
            única camada estática, sem gradientes empilhados nem opacity
            animada via React — evita um glitch de composição do Chromium
            observado ao combinar isso com o header sticky + backdrop-blur). */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.08),rgba(0,0,0,0)_55%)] animate-[heroFadeIn_1.6s_ease-out]"
        />

        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <p
            style={{
              opacity: phrase1Opacity,
              transform: `translateY(${phrase1Shift}px)`,
              pointerEvents: phrase1Opacity > 0.1 ? "auto" : "none",
            }}
            className="absolute max-w-2xl font-serif text-3xl leading-tight font-black text-white sm:text-5xl"
          >
            Onde um jornalista precisa ir para contar uma guerra?
          </p>
          <p
            style={{
              opacity: phrase2Opacity,
              transform: `translateY(${phrase2Shift}px)`,
              pointerEvents: phrase2Opacity > 0.1 ? "auto" : "none",
            }}
            className="absolute max-w-2xl font-serif text-3xl leading-tight font-black text-white sm:text-5xl"
          >
            E o que ele encontra quando chega lá?
          </p>
        </div>

        <div
          className="absolute inset-x-0 bottom-8 z-10 flex justify-center text-xs font-semibold tracking-widest text-neutral-400 uppercase transition-opacity duration-500"
          style={{ opacity: progress > 0.85 ? 0 : 1 }}
        >
          Role para explorar ↓
        </div>
      </div>
    </div>
  );
}
