import { prisma } from "@/lib/prisma";
import JournalistForm from "@/components/admin/JournalistForm";

export const dynamic = "force-dynamic";

export default async function NewJournalistPage() {
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-black">Novo jornalista</h1>
      <JournalistForm locations={locations} />
    </div>
  );
}
