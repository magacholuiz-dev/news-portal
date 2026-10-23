import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { getSiteTitle } from "@/lib/settings";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteTitle = await getSiteTitle();
  return (
    <div>
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-serif text-xl font-black">
            Admin · {siteTitle}
          </Link>
          <nav className="hidden gap-4 text-sm font-medium text-neutral-600 sm:flex">
            <Link href="/admin" className="hover:text-neutral-900">
              Matérias
            </Link>
            <Link
              href="/admin/articles/new"
              className="hover:text-neutral-900"
            >
              Nova matéria
            </Link>
            <Link href="/admin/territories" className="hover:text-neutral-900">
              Pontos do mapa
            </Link>
            <Link href="/admin/journalists" className="hover:text-neutral-900">
              Jornalistas
            </Link>
            <Link href="/admin/quotes" className="hover:text-neutral-900">
              Falas
            </Link>
            <Link href="/admin/settings" className="hover:text-neutral-900">
              Configurações
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Ver site &rarr;
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
