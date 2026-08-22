import PageShell from "@/components/layout/PageShell";
import JobsContent from "@/components/jobs/JobsContent";

export default function JobsPage() {
  return (
    <PageShell
      title="Jobs"
      description="All jobs in the graph. Filter by role, location, level, remote, skill or industry. Match % shown when a developer is configured."
    >
      <JobsContent />
    </PageShell>
  );
}
