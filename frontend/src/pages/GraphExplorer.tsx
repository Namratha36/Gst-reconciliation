import { useEffect, useState } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api } from "@/services/api";

export default function GraphExplorer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await api.get("/graph/explorer");
        const data = res.data;
        
        // Map backend format to React Flow format with enterprise colors
        const initialNodes = data.nodes.map((n: any) => ({
          id: n.id.toString(),
          data: { label: n.label },
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          style: {
            background: n.type === 'vendor' ? (n.risk === 'High' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))') : (n.type === 'buyer' ? 'hsl(var(--secondary))' : 'hsl(var(--card))'),
            color: n.type === 'invoice' ? 'hsl(var(--foreground))' : '#fff',
            border: n.type === 'invoice' ? '1px solid hsl(var(--border))' : 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 500,
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
          }
        }));

        const initialEdges = data.edges.map((e: any, index: number) => ({
          id: `e-${e.source}-${e.target}-${index}`,
          source: e.source.toString(),
          target: e.target.toString(),
          label: e.label,
          animated: true,
          style: { stroke: 'hsl(var(--muted-foreground))' },
          labelStyle: { fill: 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 10 },
          labelBgStyle: { fill: 'hsl(var(--background))' }
        }));

        setNodes(initialNodes);
        setEdges(initialEdges);
      } catch (err) {
        console.error("Failed to load graph data", err);
      }
    }
    fetchGraph();
  }, []);

  return (
    <div className="w-full h-[85vh] flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Knowledge Graph Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Investigate structural risks and vendor-invoice relationships.</p>
      </div>
      <div className="flex-1 bg-card border rounded-md shadow-sm overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className="bg-background"
        >
          <MiniMap className="bg-card border rounded mask-color-muted" maskColor="hsl(var(--muted))" />
          <Controls className="bg-card border rounded" />
          <Background color="hsl(var(--border))" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
