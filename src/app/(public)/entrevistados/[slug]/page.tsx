import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JournalistProfileView from "@/components/JournalistProfileView";
import { getJournalistBySlug } from "@/lib/report";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const j = await getJournalistBySlug(slug);
  return j ? { title: j.name, description: j.role ?? undefined } : {};
}

export default async function JournalistPage({ params }: PageParams) {
  const { slug } = await params;
  const journalist = await getJournalistBySlug(slug);
  if (!journalist) notFound();
  return (
    <div className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-4xl">
        <JournalistProfileView journalist={journalist} />
      </div>
    </div>
  );
}
