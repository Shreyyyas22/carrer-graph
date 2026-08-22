import PageShell from "@/components/layout/PageShell";
import CompanyDetailContent from "@/components/companies/CompanyDetailContent";

export default async function CompanyDetailPage({ params }) {
  const { id } = await params;
  return (
    <PageShell title="Company" description="Industry, open jobs, and technologies used.">
      <CompanyDetailContent companyId={id} />
    </PageShell>
  );
}
