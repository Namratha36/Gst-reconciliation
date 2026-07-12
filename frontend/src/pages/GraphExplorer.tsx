import { useEffect, useMemo, useState } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BrainCircuit, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { graphService } from "@/services/graphService";
import type { GraphEdge, GraphNode, GraphNodeType } from "@/types/domain";

const typePositions: Record<GraphNodeType, { x: number; y: number }> = {
  Upload: { x: 0, y: 0 },
  Vendor: { x: 40, y: 90 },
  Invoice: { x: 280, y: 90 },
  Buyer: { x: 520, y: 90 },
  Case: { x: 280, y: 240 },
  Action: { x: 80, y: 390 },
  Approval: { x: 280, y: 390 },
  Alert: { x: 500, y: 390 },
  Report: { x: 280, y: 540 },
  RiskScore: { x: 40, y: 240 },
};

export default function GraphExplorer() {
  const [domainNodes, setDomainNodes] = useState<GraphNode[]>([]);
  const [domainEdges, setDomainEdges] = useState<GraphEdge[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<GraphNodeType | "All">("All");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    void graphService.getGraph().then((graph) => {
      setDomainNodes(graph.nodes);
      setDomainEdges(graph.edges);
    });
  }, []);

  const visibleDomainNodes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return domainNodes.filter((node) => {
      const matchesQuery = !normalized || node.label.toLowerCase().includes(normalized) || node.entityId.toLowerCase().includes(normalized);
      const matchesType = typeFilter === "All" || node.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [domainNodes, query, typeFilter]);

  const visibleIds = useMemo(() => new Set(visibleDomainNodes.map((node) => node.id)), [visibleDomainNodes]);
  const flowNodes = useMemo<Node[]>(() => visibleDomainNodes.map(toFlowNode), [visibleDomainNodes]);
  const flowEdges = useMemo<Edge[]>(() => domainEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map(toFlowEdge), [domainEdges, visibleIds]);
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setEdges, setNodes]);

  const nodeTypes: Array<GraphNodeType | "All"> = ["All", "Vendor", "Invoice", "Buyer", "Case", "Action", "Approval", "Alert"];

  return (
    <div className="w-full h-[85vh] flex flex-col space-y-4 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            Knowledge Graph
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Relationships from GraphService across vendors, invoices, cases, actions, approvals, and alerts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search graph entities..." className="pl-9 h-9" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {nodeTypes.map((type) => (
              <Button key={type} variant={typeFilter === type ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(type)} className="h-9">
                {type === "All" && <SlidersHorizontal className="w-4 h-4 mr-1.5" />}
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="flex-1 bg-card border rounded-lg shadow-sm overflow-hidden relative min-h-[420px]">
          {nodes.length === 0 ? (
            <div className="h-full min-h-[420px] flex items-center justify-center text-center text-sm text-muted-foreground p-6">
              No graph data returned by the backend. Connect `/api/graph` after uploads, reconciliation, cases, actions, and approvals are stored.
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) => setSelectedNode(domainNodes.find((item) => item.id === node.id) ?? null)}
              fitView
              className="bg-muted/10"
            >
              <MiniMap className="bg-card border rounded-lg mask-color-muted" maskColor="hsl(var(--muted))" />
              <Controls className="bg-card border rounded-lg" />
              <Background color="hsl(var(--border))" gap={16} />
            </ReactFlow>
          )}
        </div>

        <div className="w-full lg:w-80 bg-card border rounded-lg shadow-sm p-5 flex flex-col">
          <h3 className="font-semibold text-lg mb-1 tracking-tight">Node Inspector</h3>
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-semibold">Backend Entity Details</p>
          {selectedNode ? (
            <div className="space-y-4 flex-1">
              <InspectorField label="Selected Node" value={selectedNode.label} />
              <InspectorField label="Entity ID" value={selectedNode.entityId} />
              <InspectorField label="Entity Type" value={selectedNode.type} />
              {selectedNode.riskTier && <InspectorField label="Risk Tier" value={selectedNode.riskTier} />}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Metadata</label>
                <pre className="mt-1 text-xs bg-muted/50 p-3 rounded border overflow-auto max-h-48">{JSON.stringify(selectedNode.metadata, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-4">Select a node to inspect its backend ID and metadata.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function toFlowNode(node: GraphNode): Node {
  const position = typePositions[node.type] ?? { x: 0, y: 0 };
  return {
    id: node.id,
    type: "default",
    data: { label: node.label },
    position,
    style: {
      background: node.riskTier === "Critical" ? "hsl(var(--destructive))" : node.riskTier === "High" ? "hsl(var(--warning))" : "hsl(var(--card))",
      color: node.riskTier === "Critical" ? "#fff" : "hsl(var(--foreground))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
      padding: "10px",
    },
  };
}

function toFlowEdge(edge: GraphEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.relationship,
    animated: edge.animated,
  };
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase">{label}</label>
      <div className="mt-1 text-sm font-medium bg-muted/50 p-2 rounded border border-transparent">{value}</div>
    </div>
  );
}
