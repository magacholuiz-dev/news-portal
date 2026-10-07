export type CoverageRow = {
  name: string;
  coveragePct: number;
  mediaAttentionClass: string | null;
  isAnchorEpisode: boolean;
};

/**
 * Nomes de Location vêm como "Cidade, País" (ex: "Port Moresby,
 * Papua-Nova Guiné"). O rótulo do gráfico usa só o país/território —
 * mais curto e mais legível, cabe melhor na coluna estreita do mobile.
 * O nome completo continua disponível no `title` (tooltip) e na lista
 * acessível abaixo.
 */
function shortLabel(name: string) {
  const parts = name.split(",");
  return parts.length > 1 ? parts.slice(1).join(",").trim() : name;
}

/**
 * Seção 04 parte 2: gráfico de barras horizontal, série única (cobertura
 * midiática por território), ordenado por magnitude. Segue a skill
 * dataviz: uma única cor sequencial (não precisa de paleta categórica
 * pois não há múltiplas séries), rótulo direto na ponta de cada barra em
 * vez de eixo numérico denso, barra <=24px com ponta arredondada, grade
 * recessiva.
 *
 * Implementado em HTML/CSS (flex + barra em %), não SVG: um viewBox de
 * SVG encolhe junto com a largura do container, e nessa largura
 * estreita (mobile) o texto ficava com menos de 7px de altura —
 * ilegível. Layout flex reflui mantendo o texto em tamanho real em
 * qualquer largura de tela.
 */
export default function CoverageBarChart({ rows }: { rows: CoverageRow[] }) {
  const sorted = [...rows].sort((a, b) => b.coveragePct - a.coveragePct);
  const max = Math.max(...sorted.map((r) => r.coveragePct), 1);

  return (
    <div className="border-t border-white/10 bg-neutral-950 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-bold tracking-widest text-amber-400 uppercase">
          Cobertura comparada
        </p>
        <h3 className="font-serif text-2xl font-black text-white sm:text-3xl">
          Proporção de cobertura midiática por território
        </h3>
        <p className="mt-3 max-w-xl text-sm text-neutral-400">
          Participação relativa de cada território no volume de notícias
          internacionais mapeado pelo projeto — do mais hipercoberto ao mais
          silenciado.
        </p>

        <div className="mt-8 space-y-2.5" role="img" aria-label="Proporção de cobertura midiática por território, ordenado do maior para o menor">
          {sorted.map((row) => {
            const pct = Math.max((row.coveragePct / max) * 100, 1.5);
            return (
              <div key={row.name} className="flex items-center gap-2 sm:gap-3">
                <div
                  title={row.name}
                  className="w-20 shrink-0 truncate text-right text-[11px] text-neutral-300 sm:w-36 sm:text-xs"
                >
                  {shortLabel(row.name)}
                  {row.isAnchorEpisode ? " 🎬" : ""}
                </div>
                <div className="h-5 min-w-0 flex-1 rounded bg-white/5">
                  <div
                    className="h-5 rounded bg-amber-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-10 shrink-0 text-[11px] font-semibold text-neutral-400 sm:w-12 sm:text-xs">
                  {row.coveragePct}%
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-neutral-500">
          🎬 Território com episódio em vídeo publicado.
        </p>

        {/* Alternativa acessível: mesma informação em lista, só pra leitor
            de tela (sr-only) — as barras acima não têm fallback textual
            navegável equivalente a uma lista. */}
        <ul className="sr-only">
          {sorted.map((row) => (
            <li key={row.name}>
              {row.name}: {row.coveragePct}% de cobertura, classificação{" "}
              {row.mediaAttentionClass ?? "não informada"}.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
