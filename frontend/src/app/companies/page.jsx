import PageShell from "@/components/layout/PageShell";
import CompaniesContent from "@/components/companies/CompaniesContent";

export default function CompaniesPage() {
  return (
    <PageShell
      title="Companies"
      description="All companies in the graph with their industry and open job count."
    >
      <CompaniesContent />
    </PageShell>
  );
}
