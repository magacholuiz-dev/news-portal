import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { quoteKindLabel } from "@/lib/quote-kinds";
import { CONTINENTS } from "@/lib/continents";
import { formatTimecode } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: [{ kind: "asc" }, { locationId: "asc" }, { displayOrder: "asc" }, { id: "asc" }],
    include: { journalist: true, location: true },
  });
  const continentLabel = (v: string | null) => CONTINENTS.find((c) => c.value === v)?.label ?? v ?? "";
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-black">Falas</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Aspas e áudios dos jornalistas. Cada fala é cadastrada uma vez e aparece onde o tipo indica: capítulos,
            reportagem do território, cartões da Análise de dados e modo comparação. Só vai pro site o que estiver
            publicado.
          </p>
        </div>
        <Link href="/admin/quotes/new" className="rounded-sm bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
          + Nova fala
        </Link>
      </div>
      {quotes.length === 0 ? (
        <p className="text-neutral-500">Nenhuma fala cadastrada ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Onde</th>
                <th className="px-4 py-3">Jornalista</th>
                <th className="px-4 py-3">Fala</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {quotes.map((q) => (
                <tr key={q.id} className="align-top">
                  <td className="px-4 py-3 text-xs font-semibold text-neutral-700">
                    {quoteKindLabel(q.kind)}
                    {q.audioUrl && <span className="ml-1">🔊</span>}
                    {q.videoStartSeconds != null && <span className="ml-1 font-normal text-neutral-400">▶ {formatTimecode(q.videoStartSeconds)}</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{q.location?.name ?? continentLabel(q.continent)}</td>
                  <td className="px-4 py-3 text-neutral-500">{q.journalist?.name ?? "—"}</td>
                  <td className="max-w-xs px-4 py-3 text-neutral-800"><p className="line-clamp-2">{q.text}</p></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${q.published ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
                        {q.published ? "Publicada" : "Rascunho"}
                      </span>
                      {q.needsReview && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Conferir transcrição</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/quotes/${q.id}/edit`} className="text-neutral-600 hover:text-neutral-900">Editar</Link>
                      <DeleteButton url={`/api/admin/quotes/${q.id}`} confirmText="Excluir esta fala? Essa ação não pode ser desfeita." />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
