import PageShell from "@/components/layout/PageShell";
import DashboardContent from "@/components/dashboard/DashboardContent";

const DEVELOPER_ID = process.env.NEXT_PUBLIC_DEFAULT_DEVELOPER_ID;

export default function Home() {
  return (
    <PageShell
      title="Dashboard"
      description="Your skills, matched against every job in the graph."
    >
      <DashboardContent developerId={DEVELOPER_ID} />
    </PageShell>
  );
}
