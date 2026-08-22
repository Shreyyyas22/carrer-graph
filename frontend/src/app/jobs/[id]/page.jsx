import PageShell from "@/components/layout/PageShell";
import JobDetailContent from "@/components/jobs/JobDetailContent";

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  return (
    <PageShell title="Job detail" description="Graph-derived match, skill gap and similar jobs.">
      <JobDetailContent jobId={id} />
    </PageShell>
  );
}
