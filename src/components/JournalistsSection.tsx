import Link from "next/link";

export type JournalistCard = {
  slug: string;
  name: string;
  role: string | null;
  /** Locais/conflitos que o jornalista cobriu. */
  places: string[];
  photoUrl: string | null;
};

/** Seção Entrevistados (no lugar de Reportagens): um cartão por
 * jornalista, que abre o perfil numa janela sobreposta. */
export default function JournalistsSection({
  journalists,
}: {
  journalists: JournalistCard[];
}) {
  return (
    <section id="entrevistados" className="scroll-mt-20 bg-neutral-900 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-4 font-serif text-3xl font-black text-white sm:text-4xl">
          Entrevistados
        </h2>
        <p className="mb-10 max-w-2xl text-base text-neutral-300">
          Quem esteve lá. Cada conflito é contado por quem o cobriu — abra o
          perfil para ver os conflitos que cobriu, as fotos em campo e as
          falas que não entraram nos vídeos.
        </p>
        {journalists.length === 0 && (
          <p className="border border-dashed border-white/20 px-5 py-10 text-center text-sm text-neutral-400">
            Os perfis dos entrevistados entram em breve.
          </p>
        )}
        {/* Sempre 3 colunas (3×3 com 9 jornalistas), foto quadrada: grade
            alinhada como no Instagram, inclusive no celular. */}
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2 sm:gap-5">
          {journalists.map((j) => (
            <Link
              key={j.slug}
              href={`/entrevistados/${j.slug}`}
              scroll={false}
              className="group flex h-full flex-col border border-white/10 transition-colors hover:border-amber-400/50"
            >
              <div className="aspect-square w-full shrink-0 overflow-hidden bg-neutral-800">
                {j.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={j.photoUrl}
                    alt={j.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-6xl font-black text-neutral-600">
                    {j.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="p-2 sm:p-3">
                <h3 className="font-serif text-xs leading-snug font-bold text-white group-hover:underline sm:text-base">
                  {j.name}
                </h3>
                {/* "Jornalista - Sudão do Sul - México": função + cada local */}
                <p className="mt-0.5 line-clamp-3 text-[10px] leading-snug text-neutral-400 sm:text-xs">
                  {[j.role || "Jornalista", ...j.places].join(" - ")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
