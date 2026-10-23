import { notFound } from "next/navigation";
import Modal from "@/components/Modal";
import JournalistProfileView from "@/components/JournalistProfileView";
import { getJournalistBySlug } from "@/lib/report";

export const dynamic = "force-dynamic";

export default async function JournalistModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journalist = await getJournalistBySlug(slug);
  if (!journalist) notFound();
  return (
    <Modal>
      <JournalistProfileView journalist={journalist} />
    </Modal>
  );
}
