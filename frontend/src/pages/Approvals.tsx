import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Edit2, ShieldAlert, Bot, BrainCircuit } from "lucide-react";
import { toast } from "sonner";

export default function Approvals() {
  const [queue, setQueue] = useState([
    {
      id: "REQ-992",
      type: "Draft Vendor Email",
      target: "Beta Industries",
      reason: "₹12.0L ITC at risk. Vendor has not filed GSTR-1 for 2 months.",
      confidence: 96,
      payload: "Dear Beta Industries,\n\nWe noticed a discrepancy of ₹12.0L in our ITC reconciliation due to unfiled GSTR-1 returns. Please file immediately to avoid payment holds.\n\nGraphGST AI Agent"
    },
    {
      id: "REQ-991",
      type: "Escalate to Finance Manager",
      target: "Acme Logistics",
      reason: "Circular trading pattern detected in knowledge graph (Confidence: High). Manual intervention required.",
      confidence: 99,
      payload: "Action: Escalate Case CAS-098\nReason: Structural risk anomaly detected."
    }
  ]);

  const handleAction = (id: string, action: string) => {
    setQueue(queue.filter(q => q.id !== id));
    toast.success(`Request ${action}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-warning" />
          Human Approval Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review and authorize critical actions proposed by the autonomous agent.</p>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card border-dashed">
          <Check className="w-12 h-12 text-success mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">All caught up!</h3>
          <p className="text-muted-foreground text-sm mt-1">No pending approvals required.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {queue.map((req) => (
              <motion.div 
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              >
                <Card className="border-l-4 border-l-warning shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-warning/20 text-warning p-2 rounded-lg">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-foreground">{req.type}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">Target: <span className="font-semibold text-foreground">{req.target}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono bg-background border px-2 py-1 rounded text-muted-foreground">ID: {req.id}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                            <BrainCircuit className="w-3.5 h-3.5" /> AI Reasoning
                          </h4>
                          <p className="text-sm bg-muted/50 p-3 rounded-md border border-transparent leading-relaxed text-foreground">
                            {req.reason}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Confidence Score</h4>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-success" style={{ width: `${req.confidence}%` }} />
                            </div>
                            <span className="text-sm font-mono font-bold text-success">{req.confidence}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col h-full">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Payload Preview</h4>
                        <div className="flex-1 bg-muted/30 border rounded-md p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                          {req.payload}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleAction(req.id, "Rejected")} className="hover:bg-destructive/10 hover:text-destructive">
                        <X className="w-4 h-4 mr-1.5" /> Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-1.5" /> Modify
                      </Button>
                      <Button size="sm" onClick={() => handleAction(req.id, "Approved")} className="bg-success hover:bg-success/90 text-white">
                        <Check className="w-4 h-4 mr-1.5" /> Approve & Execute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
