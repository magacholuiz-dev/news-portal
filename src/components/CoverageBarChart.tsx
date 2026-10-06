export type CoverageRow = {
  name: string;
  coveragePct: number;
  mediaAttentionClass: string | null;
  isAnchorEpisode: boolean;
};

const BAR_HEIGHT = 20; // <= 24px per mark spec
const ROW_GAP = 14;
const LABEL_WIDTH = 168;
const CHART_WIDTH = 560;
const TRACK_WIDTH = CHART_WIDTH - LABEL_WIDTH - 56; // espaço pro valor à direita

/**
 * Seção 04 parte 2: gráfico de barras horizontal, série única (cobertura
 * midiática por território), ordenado por magnitude. Segue a skill
 * dataviz: uma única cor sequencial (não precisa de paleta categórica
 * pois não há múltiplas séries), rótulo direto na ponta de cada barra em
 * vez de eixo numérico denso, barra <=24px com ponta arredondada, grade
 * recessiva, e uma tabela oculta (sr-only) como alternativa acessível.
 */
export default function CoverageBarChart({ rows }: { rows: CoverageRow[] }) {
  const sorted = [...rows].sort((a, b) => b.coveragePct - a.coveragePct);
  const max = Math.max(...sorted.map((r) => r.coveragePct), 1);
  const height = sorted.length * (BAR_HEIGHT + ROW_GAP);

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

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        width="100%"
        role="img"
        aria-labelledby="coverage-chart-title"
        className="mt-8"
      >
        <title id="coverage-chart-title">
          Proporção de cobertura midiática por território, ordenado do maior
          para o menor
        </title>
        {sorted.map((row, index) => {
          const y = index * (BAR_HEIGHT + ROW_GAP);
          const barWidth = Math.max((row.coveragePct / max) * TRACK_WIDTH, 2);
          return (
            <g key={row.name}>
              <text
                x={LABEL_WIDTH - 10}
                y={y + BAR_HEIGHT / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-neutral-300"
                style={{ fontSize: 12 }}
              >
                {row.name}
                {row.isAnchorEpisode ? " 🎬" : ""}
              </text>
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={TRACK_WIDTH}
                height={BAR_HEIGHT}
                rx={4}
                className="fill-white/5"
              />
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={barWidth}
                height={BAR_HEIGHT}
                rx={4}
                fill="#f5c94b"
              />
              <text
                x={LABEL_WIDTH + barWidth + 8}
                y={y + BAR_HEIGHT / 2}
                dominantBaseline="middle"
                className="fill-neutral-400"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                {row.coveragePct}%
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-2 text-[11px] text-neutral-500">
        🎬 Território com episódio em vídeo publicado.
      </p>

      {/* Alternativa acessível: mesma informação em tabela, só pra leitor
          de tela (sr-only) — o SVG acima não tem fallback textual nativo
          equivalente a uma tabela navegável. */}
      <table className="sr-only">
        <caption>Proporção de cobertura midiática por território</caption>
        <thead>
          <tr>
            <th scope="col">Território</th>
            <th scope="col">Cobertura (%)</th>
            <th scope="col">Classificação</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.coveragePct}%</td>
              <td>{row.mediaAttentionClass ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
