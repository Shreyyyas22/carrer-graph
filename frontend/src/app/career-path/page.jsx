import PageShell from "@/components/layout/PageShell";
import CareerPathContent from "@/components/career-path/CareerPathContent";

export default function CareerPathPage() {
  return (
    <PageShell
      title="Career path"
      description="Pick a current role and a target role — the graph shows developers who have made that transition."
    >
      <CareerPathContent />
    </PageShell>
  );
}
