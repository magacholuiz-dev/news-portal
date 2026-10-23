import Link from "next/link";
import AudioClip from "./AudioClip";
import type { QuoteDTO } from "@/lib/public-types";

export type PassportCardData = {
  name: string;
  displayOrder: number | null;
  coveragePct: number | null;
  mediaAttentionClass: string | null;
  journalistNote: string | null;
  accessCategory: string | null;
  riskLevelRSF: string | null;
  journalistsKilled?: number | null;
  journalistsKilledNote?: string | null;
  /** "Quem esteve lá": fala curta (+ áudio de ~15 s) do jornalista. */
  quote?: QuoteDTO | null;
  /** Slug da reportagem do território (abre em janela sobreposta). */
  reportSlug?: string | null;
};

// Cor do "carimbo" por categoria de acesso (aba gid=3804457 da
// planilha, coluna Status_Carimbo). Território sem accessCategory
// preenchido cai no cinza "Dado pendente" (nunca inventa um valor).
const STAMP_STYLES: Record<string, { label: string; className: string }> = {
  "Visto Concedido": {
    label: "Visto concedido",
    className: "border-emerald-400 text-emerald-400",
  },
  "Visto Condicionado": {
    label: "Visto condicionado",
    className: "border-sky-400 text-sky-400",
  },
  "Zona de Risco": {
    label: "Zona de risco",
    className: "border-amber-400 text-amber-400",
  },
  "Entrada Barrada": {
    label: "Entrada barrada",
    className: "border-red-400 text-red-400",
  },
};

export function Stamp({ accessCategory }: { accessCategory: string | null }) {
  const style = accessCategory ? STAMP_STYLES[accessCategory] : null;
  return (
    <span
      className={`inline-block rotate-[-6deg] rounded-sm border-2 px-2.5 py-1 text-[11px] font-black tracking-wide uppercase ${
        style ? style.className : "border-neutral-600 text-neutral-500"
      }`}
    >
      {style ? style.label : "Dado pendente"}
    </span>
  );
}

export default function PassportCard({ territory }: { territory: PassportCardData }) {
  return (
    <div className="w-full max-w-sm border border-white/15 bg-neutral-900 p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-white/20 pb-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
            Território {territory.displayOrder ?? "—"} / 14
          </p>
          <h4 className="font-serif text-lg leading-tight font-black text-white">
            {territory.name}
          </h4>
        </div>
        <Stamp accessCategory={territory.accessCategory} />
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500">Cobertura midiática</dt>
          <dd className="font-semibold text-white">
            {territory.coveragePct !== null ? `${territory.coveragePct}%` : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500">Classificação</dt>
          <dd className="text-right font-semibold text-white">
            {territory.mediaAttentionClass ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500">Risco (RSF)</dt>
          <dd className="text-right font-semibold text-white">
            {territory.riskLevelRSF ?? "Dado pendente"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500">Jornalistas mortos</dt>
          <dd className="text-right font-semibold text-white">
            {territory.journalistsKilled != null
              ? territory.journalistsKilled
              : "Dado pendente"}
            {territory.journalistsKilled != null &&
              territory.journalistsKilledNote && (
                <span className="ml-1 text-xs font-normal text-neutral-500">
                  {territory.journalistsKilledNote}
                </span>
              )}
          </dd>
        </div>
      </dl>

      {territory.journalistNote && (
        <p className="mt-3 border-t border-dashed border-white/20 pt-3 text-xs leading-relaxed text-neutral-400">
          {territory.journalistNote}
        </p>
      )}

      {territory.quote && (
        <div className="mt-3 border-t border-dashed border-white/20 pt-3">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-amber-400 uppercase">
            Quem esteve lá
          </p>
          <p className="text-sm leading-snug text-neutral-200">
            &ldquo;{territory.quote.text}&rdquo;
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            {territory.quote.journalistName && (
              <span>{territory.quote.journalistName}</span>
            )}
            {territory.quote.audioUrl && (
              <AudioClip src={territory.quote.audioUrl} label="Ouvir 15s" />
            )}
          </p>
        </div>
      )}

      {territory.reportSlug && (
        <Link
          href={`/article/${territory.reportSlug}`}
          scroll={false}
          className="mt-4 inline-block text-xs font-bold tracking-wide text-amber-400 uppercase hover:underline"
        >
          Ler a reportagem &rarr;
        </Link>
      )}
    </div>
  );
}
