import { useCallback, useEffect, useState } from "react";
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
        
        // Map backend format to React Flow format
        const initialNodes = data.nodes.map((n: any, index: number) => ({
          id: n.id.toString(),
          data: { label: n.label },
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          style: {
            background: n.type === 'vendor' ? (n.risk === 'High' ? '#ef4444' : '#f59e0b') : (n.type === 'buyer' ? '#3b82f6' : '#fff'),
            color: n.type === 'invoice' ? '#000' : '#fff',
            border: '1px solid #222',
            borderRadius: '5px',
            padding: '10px'
          }
        }));

        const initialEdges = data.edges.map((e: any, index: number) => ({
          id: `e-${e.source}-${e.target}-${index}`,
          source: e.source.toString(),
          target: e.target.toString(),
          label: e.label,
          animated: true,
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
    <div className="w-full h-[85vh] p-4 flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Graph Explorer</h1>
        <p className="text-muted-foreground mt-1">Interactive visualization of Vendor-Invoice-Buyer relationships.</p>
      </div>
      <div className="flex-1 glass border border-border/50 rounded-xl shadow-sm overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className="bg-background"
        >
          <MiniMap className="bg-background border-border/50 rounded-lg" maskColor="hsl(var(--muted))" />
          <Controls className="bg-background border-border/50 rounded-lg" />
          <Background color="hsl(var(--muted-foreground))" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
