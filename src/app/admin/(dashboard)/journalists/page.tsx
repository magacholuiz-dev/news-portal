import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminJournalistsPage() {
  const journalists = await prisma.journalist.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { quotes: true, photos: true } } },
  });
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-black">Jornalistas</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Os entrevistados. Cada um vira um cartão na seção Entrevistados, com perfil em janela sobreposta,
            galeria e as falas que você cadastrar em &ldquo;Falas&rdquo;.
          </p>
        </div>
        <Link href="/admin/journalists/new" className="rounded-sm bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
          + Novo jornalista
        </Link>
      </div>
      {journalists.length === 0 ? (
        <p className="text-neutral-500">Nenhum jornalista cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Falas</th>
                <th className="px-4 py-3">Fotos</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {journalists.map((j) => (
                <tr key={j.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {j.name}
                    {j.role && <span className="ml-2 text-xs font-normal text-neutral-400">{j.role}</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{j._count.quotes}</td>
                  <td className="px-4 py-3 text-neutral-500">{j._count.photos}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${j.published ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
                      {j.published ? "No site" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/journalists/${j.id}/edit`} className="text-neutral-600 hover:text-neutral-900">Editar</Link>
                      <DeleteButton url={`/api/admin/journalists/${j.id}`} confirmText={`Excluir ${j.name}? A galeria dele também é excluída; as falas ficam sem autor e voltam a rascunho.`} />
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
