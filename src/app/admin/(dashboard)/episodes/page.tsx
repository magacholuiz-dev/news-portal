import EpisodesManager from "@/components/admin/EpisodesManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEpisodesPage() {
  const episodes = await prisma.episode.findMany({ orderBy: [{ displayOrder: "asc" }, { id: "asc" }] });
  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-black">Episódios</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-500">
        Os vídeos da série (publicados no YouTube) que aparecem logo depois da abertura. Cole o link de cada um. O
        texto de introdução e o título da seção ficam em Configurações; o áudio das entrevistas (Spotify) é cadastrado
        em cada jornalista.
      </p>
      <EpisodesManager
        initial={episodes.map((e) => ({
          key: String(e.id),
          title: e.title,
          videoUrl: e.videoUrl,
          duration: e.duration ?? "",
          published: e.published,
        }))}
      />
    </div>
  );
}
