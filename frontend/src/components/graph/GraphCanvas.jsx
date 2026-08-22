"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d").then((m) => m.default ?? m), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Loading graph visualization…
    </div>
  ),
});

const LABEL_COLORS = {
  Developer: "#4f46e5",
  Skill: "#0891b2",
  Technology: "#7c3aed",
  Job: "#059669",
  Company: "#d97706",
  Role: "#e11d48",
  Industry: "#ca8a04",
  Location: "#475569",
  LearningResource: "#0e7490",
};

const FALLBACK_COLOR = "#94a3b8";

function colorFor(label) {
  return LABEL_COLORS[label] ?? FALLBACK_COLOR;
}

function labelOf(node) {
  return node.name ?? node.title ?? node.city ?? node.email ?? node.id ?? "Node";
}

export default function GraphCanvas({ graph, onNodeClick }) {
  const fgRef = useRef(null);

  const handleEngineStop = useCallback(() => {
    // zoom to fit once the simulation settles so the star hub isn't clipped
    fgRef.current?.zoomToFit(400, 32);
  }, []);

  if (!graph || graph.nodes.length === 0) return null;

  const hubIds = new Set();
  // detect star hub (node with degree > 4) to put it at center
  const degree = {};
  for (const r of graph.relationships) {
    degree[r.source] = (degree[r.source] || 0) + 1;
    degree[r.target] = (degree[r.target] || 0) + 1;
  }
  let hubId = null;
  let maxDeg = 0;
  for (const [id, d] of Object.entries(degree)) {
    if (d > maxDeg) {
      maxDeg = d;
      hubId = id;
    }
  }

  const data = {
    nodes: graph.nodes.map((n) => ({
      ...n,
      label: n.label,
      displayLabel: labelOf(n),
      color: colorFor(n.label),
      // pin hub lightly at origin so it doesn't drift while spokes spread
      ...(n.id === hubId ? { fx: 0, fy: 0 } : {}),
    })),
    links: graph.relationships.map((r) => ({ source: r.source, target: r.target, type: r.type })),
  };

  const isStar = maxDeg >= 9;

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel={(n) => `${n.label}: ${n.displayLabel}`}
        nodeColor={(n) => n.color}
        nodeRelSize={6}
        linkColor={() => "#cbd5e1"}
        linkWidth={1.2}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkCurvature={isStar ? 0.08 : 0.18}
        dagMode={isStar ? "radialout" : undefined}
        dagLevelDistance={isStar ? 72 : undefined}
        onNodeClick={(node) => onNodeClick?.(node)}
        onEngineStop={handleEngineStop}
        d3AlphaDecay={0.022}
        d3VelocityDecay={0.3}
        cooldownTicks={isStar ? 80 : 120}
        warmupTicks={isStar ? 20 : 30}
        d3Force={(engine) => {
          if (isStar) return; // dag handles layout
          engine.force("charge").strength(-260);
          const link = engine.force("link");
          if (link) link.distance(92).strength(0.7);
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const r = node.id === hubId ? 9 : 6.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // don't spam labels when zoomed out — prevents central pileup
          if (globalScale < 0.65) return;
          const label = node.displayLabel;
          if (!label) return;
          const maxLen = globalScale < 0.9 ? 14 : 28;
          const shown = label.length > maxLen ? `${label.slice(0, maxLen)}…` : label;
          const fontSize = Math.max(10 / globalScale, 3.2);
          ctx.font = `${node.id === hubId ? 600 : 500} ${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          const textW = ctx.measureText(shown).width;
          const padX = 4;
          const padY = 2;
          const bx = node.x + r + 5;
          const by = node.y;
          ctx.fillStyle = "rgba(255,255,255,0.94)";
          // rounded background
          const rx = 4;
          ctx.beginPath();
          ctx.roundRect(bx - padX, by - fontSize / 2 - padY, textW + padX * 2, fontSize + padY * 2, rx);
          ctx.fill();
          ctx.strokeStyle = "rgba(226,232,240,0.9)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = node.id === hubId ? "#0f172a" : "#1f2937";
          ctx.fillText(shown, bx, by);
        }}
        // edge labels hidden on canvas — neighbor list below is the readable source
        linkCanvasObjectMode={() => undefined}
      />
    </div>
  );
}
