"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Janela sobreposta das rotas interceptadas: o leitor continua na home
 * (scroll preservado) e, ao fechar, volta exatamente onde estava. */
export default function Modal({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) router.back();
      }}
      className="fixed inset-0 z-[900] overflow-y-auto bg-black/85 px-0 py-0 sm:px-6 sm:py-8"
    >
      <div
        className={`relative mx-auto min-h-full w-full max-w-4xl shadow-2xl sm:min-h-0 sm:rounded-sm ${
          tone === "dark" ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"
        }`}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Fechar"
          className={`sticky top-3 z-10 float-right mt-3 mr-3 flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none ${
            tone === "dark"
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-neutral-900/10 text-neutral-900 hover:bg-neutral-900/20"
          }`}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
