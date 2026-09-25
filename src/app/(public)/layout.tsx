import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b-4 border-neutral-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-serif text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl"
          >
            PORTAL NOTÍCIA
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold tracking-wide text-neutral-700 uppercase sm:flex">
            <Link href="/" className="hover:text-red-700">
              Início
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500 sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} Portal Notícia. Todos os
            direitos reservados.
          </p>
          <Link href="/admin/login" className="mt-2 inline-block underline">
            Área administrativa
          </Link>
        </div>
      </footer>
    </>
  );
}
