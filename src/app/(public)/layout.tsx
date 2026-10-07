import Link from "next/link";
import MobileNav from "@/components/MobileNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-[600] border-b border-white/10 bg-neutral-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="font-serif text-lg font-black tracking-tight text-white sm:text-xl"
          >
            PORTAL NOTÍCIA
          </Link>
          <nav className="hidden gap-5 text-xs font-semibold tracking-wide text-neutral-200 uppercase sm:flex">
            <Link href="/#hero" className="hover:text-amber-400">
              O Projeto
            </Link>
            <Link href="/#capitulos" className="hover:text-amber-400">
              Capítulos
            </Link>
            <Link href="/#analise" className="hover:text-amber-400">
              Análise de Dados
            </Link>
            <Link href="/#explorar" className="hover:text-amber-400">
              Explorar
            </Link>
            <Link href="/sobre" className="hover:text-amber-400">
              Sobre
            </Link>
          </nav>
          <MobileNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-400 sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} Portal Notícia. Todos os
            direitos reservados.
          </p>
          <Link
            href="/admin/login"
            className="mt-2 inline-block text-neutral-400 underline hover:text-neutral-200"
          >
            Área administrativa
          </Link>
        </div>
      </footer>
    </>
  );
}
