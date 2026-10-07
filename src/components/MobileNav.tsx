"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#hero", label: "O Projeto" },
  { href: "/#capitulos", label: "Capítulos" },
  { href: "/#analise", label: "Análise de Dados" },
  { href: "/#explorar", label: "Explorar" },
  { href: "/sobre", label: "Sobre" },
];

/**
 * Menu hambúrguer — a nav de desktop (layout.tsx) é `hidden sm:flex`,
 * então sem isso o site inteiro ficava sem nenhum jeito de navegar no
 * mobile (bug real relatado pelo usuário: "detalhes quebrando a
 * experiência" no celular).
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="flex h-9 w-9 items-center justify-center text-white"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full border-b border-white/10 bg-neutral-950 px-4 py-2 shadow-xl">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-white/5 py-3 text-sm font-semibold tracking-wide text-neutral-200 uppercase last:border-b-0 hover:text-amber-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
