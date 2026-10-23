import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/admin/QuoteForm";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const [journalists, locations] = await Promise.all([
    prisma.journalist.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-black">Nova fala</h1>
      <QuoteForm journalists={journalists} locations={locations} />
    </div>
  );
}
