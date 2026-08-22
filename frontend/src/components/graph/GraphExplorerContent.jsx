"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Network, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import GraphCanvas from "./GraphCanvas";

const LABEL_VARIANT = {
  Developer: "primary",
  Skill: "primary",
  Technology: "warning",
  Job: "success",
  Company: "warning",
  Role: "danger",
  Industry: "default",
  Location: "default",
};

function nodeLabel(node) {
  return node.name ?? node.title ?? node.city ?? node.email ?? node.id ?? "Node";
}

function nodeSubLabel(node) {
  if (node.label === "Job") return [node.level, node.remote ? "Remote" : null].filter(Boolean).join(" · ");
  if (node.label === "Location") return [node.city, node.country].filter(Boolean).join(", ");
  if (node.label === "Skill") return node.category ?? "";
  if (node.label === "Company") return node.website ?? "";
  if (node.label === "Developer") return node.email ?? "";
  return "";
}

export default function GraphExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") ?? "";
  const initialNodeId = searchParams.get("node_id") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [selected, setSelected] = useState(null); // selected node object {id,label,...}
  const [graph, setGraph] = useState(null); // {nodes,relationships}
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState(null);

  // hydrate from ?node_id= if present on first load
  useEffect(() => {
    if (!initialNodeId || selected) return;
    // fabricate a minimal selected so the graph loads; full label resolved after search or fetch
    setSelected({ id: initialNodeId, label: "Node" });
  }, [initialNodeId, selected]);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 380);
    return () => clearTimeout(t);
  }, [query]);

  // sync ?q= in URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) params.set("q", debouncedQuery);
    else params.delete("q");
    const next = params.toString();
    const curr = searchParams.toString();
    if (next !== curr) router.replace(`/graph${next ? `?${next}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // search when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);
    api
      .searchGraph(debouncedQuery)
      .then((data) => {
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setSearchError(e);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const loadNeighborhood = useCallback(
    async (node) => {
      setSelected(node);
      setGraphLoading(true);
      setGraphError(null);
      setGraph(null);
      try {
        const data = await api.getNeighborhood(node.id);
        setGraph(data);
        // push node_id to URL
        const params = new URLSearchParams(searchParams.toString());
        params.set("node_id", node.id);
        router.replace(`/graph?${params.toString()}`, { scroll: false });
      } catch (e) {
        setGraphError(e);
      } finally {
        setGraphLoading(false);
      }
      // keep full node for header (if label was generic, keep the richer one from results)
    },
    [router, searchParams]
  );

  // auto-load neighborhood if selected was hydrated from URL but no graph yet
  useEffect(() => {
    if (selected?.id && !graph && !graphLoading && !graphError) {
      // only auto-load if we don't already have a graph and selected looks like a URL hydration
      // don't refetch if query empty — still fetch to prove the pipe
      loadNeighborhood(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (node) => {
    loadNeighborhood(node);
  };

  const deepLinkFor = useCallback((node) => {
    const params = new URLSearchParams();
    params.set("node_id", node.id);
    return `/graph?node_id=${encodeURIComponent(node.id)}`;
  }, []);

  const legendLabels = useMemo(() => {
    if (!graph?.nodes?.length) return [];
    return [...new Set(graph.nodes.map((n) => n.label))];
  }, [graph]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600" /> Search the graph
          </CardTitle>
          <CardDescription>
            Try <button onClick={() => setQuery("Python")} className="font-medium text-indigo-600 hover:underline">Python</button>, a company name like Company 1, or a title like Job 12. 2+ characters.
          </CardDescription>
        </CardHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, title, city or email…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="mt-4">
          {debouncedQuery.length > 0 && debouncedQuery.length < 2 ? (
            <p className="text-sm text-gray-500">Type at least 2 characters.</p>
          ) : searchLoading ? (
            <div className="space-y-2 py-6" aria-busy>
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
            </div>
          ) : searchError ? (
            <ErrorState
              title={searchError.code === 0 || searchError.code === 503 ? "Graph database unavailable" : "Search failed"}
              message={searchError.code === 0 || searchError.code === 503 ? "CognoDB is unreachable — check the backend/DB then retry." : searchError.message}
              onRetry={() => setDebouncedQuery((q) => q)}
            />
          ) : debouncedQuery.length >= 2 && results.length === 0 ? (
            <EmptyState title="No matches" description={`No nodes contain “${debouncedQuery}”. Try a shorter prefix.`} />
          ) : results.length > 0 ? (
            <div>
              <p className="mb-2 text-sm text-gray-500">{results.length} result{results.length > 1 ? "s" : ""}</p>
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {results.map((node) => (
                  <li
                    key={`${node.label}:${node.id}`}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition hover:bg-indigo-50 ${selected?.id === node.id ? "bg-indigo-50" : "bg-white"}`}
                    onClick={() => handleSelect(node)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSelect(node);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-gray-900">
                        {nodeLabel(node)}
                        <Badge variant={LABEL_VARIANT[node.label] ?? "default"}>{node.label}</Badge>
                      </p>
                      {nodeSubLabel(node) && <p className="truncate text-xs text-gray-500">{nodeSubLabel(node)}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-indigo-600">Inspect →</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              title="Start searching"
              description="Results appear here. Pick a node to render its neighborhood below."
            />
          )}
        </div>
      </Card>

      {/* Neighborhood / viz */}
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-600" /> Neighborhood
          </CardTitle>
          <CardDescription>
            1-hop neighbors of the selected node. Click a node in the canvas to re-center on it.
            {selected ? (
              <span className="ml-1">
                Selected: <span className="font-medium text-gray-900">{nodeLabel(selected)}</span>{" "}
                {selected.label && <Badge variant={LABEL_VARIANT[selected.label] ?? "default"}>{selected.label}</Badge>}
              </span>
            ) : (
              " No node selected yet."
            )}
          </CardDescription>
        </CardHeader>

        {!selected ? (
          <EmptyState
            title="No node selected"
            description="Search above and click a result to render its graph. Try “Python” for a node with several connections."
          />
        ) : graphLoading ? (
          <div className="h-[520px] w-full animate-pulse rounded-xl border border-gray-200 bg-gray-100" aria-busy />
        ) : graphError ? (
          <ErrorState
            title={graphError.code === 0 || graphError.code === 503 ? "Graph database unavailable" : "Could not load neighborhood"}
            message={graphError.code === 0 || graphError.code === 503 ? "CognoDB is unreachable. Check that Neo4j/CognoDB is running, then retry." : graphError.message}
            onRetry={() => selected && loadNeighborhood(selected)}
          />
        ) : !graph || graph.nodes.length === 0 ? (
          <EmptyState
            title="Isolated node"
            description={`“${nodeLabel(selected)}” has no relationships in the current seed — the neighborhood is empty. Try a Skill like “Python” which is linked to jobs and a developer.`}
          />
        ) : graph.relationships.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">This node has no relationships (single-node graph). Showing the node alone.</p>
            <div className="flex flex-wrap gap-2">
              {graph.nodes.map((n) => (
                <span key={n.id} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
                  {nodeLabel(n)} <Badge variant={LABEL_VARIANT[n.label] ?? "default"}>{n.label}</Badge>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">{graph.nodes.length} nodes</span>
              <span>·</span>
              <span className="font-medium">{graph.relationships.length} relationships</span>
              <span>·</span>
              {legendLabels.map((lbl) => (
                <Badge key={lbl} variant={LABEL_VARIANT[lbl] ?? "default"}>
                  {lbl}
                </Badge>
              ))}
            </div>

            <GraphCanvas graph={graph} onNodeClick={(clicked) => loadNeighborhood(clicked)} />

            {/* Neighbor list for readability at any zoom — not the only way to the data */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Neighbors</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {graph.relationships.map((rel, idx) => {
                  const src = graph.nodes.find((n) => n.id === rel.source);
                  const tgt = graph.nodes.find((n) => n.id === rel.target);
                  return (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-medium text-gray-900">{src ? nodeLabel(src) : rel.source}</span>{" "}
                        <span className="text-gray-400">—{rel.type}→</span>{" "}
                        <span className="font-medium text-gray-900">{tgt ? nodeLabel(tgt) : rel.target}</span>
                      </span>
                      {tgt && (
                        <a
                          href={deepLinkFor(tgt)}
                          onClick={(e) => {
                            e.preventDefault();
                            loadNeighborhood(tgt);
                          }}
                          className="inline-flex shrink-0 items-center gap-1 text-xs text-indigo-600 hover:underline"
                        >
                          Center <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
