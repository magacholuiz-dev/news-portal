"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Motor genérico de scrollytelling: observa uma lista de elementos
 * (um por "passo" da narrativa) e reporta qual deles está mais perto do
 * centro vertical da tela. Usado para iluminar o continente ativo no
 * mapa conforme o usuário rola pelos capítulos.
 */
export function useScrollSteps(stepCount: number) {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = stepRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1) setActiveStep(index);
        }
      },
      // Uma faixa fina no meio da tela: o passo "ativo" é o que estiver
      // cruzando essa faixa, não o que simplesmente está visível.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    const currentRefs = stepRefs.current.slice(0, stepCount);
    currentRefs.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [stepCount]);

  function setStepRef(index: number) {
    return (el: HTMLElement | null) => {
      stepRefs.current[index] = el;
    };
  }

  return { activeStep, setStepRef };
}
