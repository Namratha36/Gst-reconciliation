import { useState } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BrainCircuit } from "lucide-react";

export default function GraphExplorer() {
  const initialNodes = [
    // Entities
    { id: '1', type: 'default', data: { label: 'Vendor: Beta Industries' }, position: { x: 250, y: 50 }, style: { background: 'hsl(var(--destructive))', color: '#fff', borderRadius: '8px', padding: '10px' } },
    { id: '2', type: 'default', data: { label: 'Invoice: INV-992' }, position: { x: 100, y: 150 }, style: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '10px' } },
    { id: '3', type: 'default', data: { label: 'Invoice: INV-993' }, position: { x: 400, y: 150 }, style: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '10px' } },
    
    // Case
    { id: '4', type: 'default', data: { label: 'Case: CAS-042 (₹12L Risk)' }, position: { x: 250, y: 250 }, style: { background: 'hsl(var(--warning))', color: '#000', borderRadius: '8px', padding: '10px' } },
    
    // Agent Actions & Workflows
    { id: '5', type: 'default', data: { label: 'Task: Draft Warning Email' }, position: { x: 50, y: 350 }, style: { background: 'hsl(var(--primary))', color: '#fff', borderRadius: '8px', padding: '10px' } },
    { id: '6', type: 'default', data: { label: 'Approval: Finance Manager' }, position: { x: 250, y: 350 }, style: { background: 'hsl(var(--secondary))', color: '#fff', borderRadius: '8px', padding: '10px' } },
    { id: '7', type: 'default', data: { label: 'Reminder: 3-Day Followup' }, position: { x: 450, y: 350 }, style: { background: 'hsl(var(--primary))', color: '#fff', borderRadius: '8px', padding: '10px' } },
    
    // Resolution
    { id: '8', type: 'default', data: { label: 'Resolution: Pending Action' }, position: { x: 250, y: 450 }, style: { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', borderRadius: '8px', padding: '10px', border: '1px dashed hsl(var(--border))' } }
  ];

  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', label: 'HAS_INVOICE', animated: true },
    { id: 'e1-3', source: '1', target: '3', label: 'HAS_INVOICE', animated: true },
    { id: 'e2-4', source: '2', target: '4', label: 'BLOCKS_ITC' },
    { id: 'e3-4', source: '3', target: '4', label: 'BLOCKS_ITC' },
    { id: 'e4-5', source: '4', target: '5', label: 'REQUIRES_ACTION', animated: true },
    { id: 'e4-6', source: '4', target: '6', label: 'REQUIRES_APPROVAL', animated: true },
    { id: 'e4-7', source: '4', target: '7', label: 'HAS_REMINDER', animated: true },
    { id: 'e6-8', source: '6', target: '8', label: 'RESOLVED_BY' },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  return (
    <div className="w-full h-[85vh] flex flex-col space-y-4 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          AI Memory & Knowledge Graph
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore the neural connections between vendors, invoices, cases, and autonomous actions.
        </p>
      </div>
      
      <div className="flex-1 flex gap-4">
        {/* Main Graph Area */}
        <div className="flex-1 bg-card border rounded-xl shadow-sm overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            className="bg-muted/10"
          >
            <MiniMap className="bg-card border rounded-lg mask-color-muted" maskColor="hsl(var(--muted))" />
            <Controls className="bg-card border rounded-lg" />
            <Background color="hsl(var(--border))" gap={16} />
          </ReactFlow>
        </div>

        {/* Node Details Sidebar */}
        {selectedNode && (
          <div className="w-80 bg-card border rounded-xl shadow-sm p-5 flex flex-col">
            <h3 className="font-semibold text-lg mb-1 tracking-tight">Node Inspector</h3>
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-semibold">AI Memory Details</p>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Selected Node</label>
                <div className="mt-1 text-sm font-medium bg-muted/50 p-2 rounded border border-transparent">
                  {selectedNode.data.label}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Entity Type</label>
                <div className="mt-1 text-sm font-medium text-foreground">
                  {selectedNode.data.label.split(':')[0]}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Context</label>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {selectedNode.id === '1' ? 'High-risk vendor with a history of late GSTR-1 filings.' :
                   selectedNode.id === '4' ? 'Critical compliance case tracking ₹12L in blocked ITC.' :
                   selectedNode.id === '6' ? 'Escalation requirement triggered by severe financial exposure.' :
                   'Standard compliance entity actively monitored by the workflow agent.'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedNode(null)}
              className="mt-4 w-full py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-md transition-colors"
            >
              Close Inspector
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
