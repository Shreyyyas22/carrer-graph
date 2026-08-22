import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import GraphExplorerContent from "@/components/graph/GraphExplorerContent";
import LoadingState from "@/components/ui/LoadingState";

export default function GraphPage() {
  return (
    <PageShell
      title="Graph Explorer"
      description="Search any entity, pick a node, and see its 1-hop neighborhood in CognoDB."
    >
      <Suspense fallback={<LoadingState message="Loading graph explorer..." />}>
        <GraphExplorerContent />
      </Suspense>
    </PageShell>
  );
}
