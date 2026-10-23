import { notFound } from "next/navigation";
import Modal from "@/components/Modal";
import ReportView from "@/components/ReportView";
import LegacyArticle from "@/components/LegacyArticle";
import { getReport } from "@/lib/report";

export const dynamic = "force-dynamic";

export default async function ArticleModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) notFound();
  if (report.structured) {
    return (
      <Modal>
        <ReportView report={report} />
      </Modal>
    );
  }
  return (
    <Modal tone="light">
      <LegacyArticle article={report.article} />
    </Modal>
  );
}
