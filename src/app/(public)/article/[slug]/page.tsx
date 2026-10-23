import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReportView from "@/components/ReportView";
import LegacyArticle from "@/components/LegacyArticle";
import { getReport } from "@/lib/report";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) return {};
  return {
    title: report.article.title,
    description: report.article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({ params }: PageParams) {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) notFound();

  if (report.structured) {
    return (
      <div className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-4xl">
          <ReportView report={report} />
        </div>
      </div>
    );
  }
  return <LegacyArticle article={report.article} />;
}
