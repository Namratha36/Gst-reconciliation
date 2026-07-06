import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, CheckCircle2, PlayCircle, Loader2 } from "lucide-react";

export default function Actions() {
  const [actions, setActions] = useState([
    { id: "ACT-842", title: "Draft Vendor Email", case: "CAS-104", status: "Running", progress: 60, assigned: "Comms Agent" },
    { id: "ACT-841", title: "Schedule 3-Day Reminder", case: "CAS-104", status: "Queued", progress: 0, assigned: "Workflow Agent" },
    { id: "ACT-840", title: "Generate Executive Report", case: "CAS-042", status: "Completed", progress: 100, assigned: "Reporting Agent" },
    { id: "ACT-839", title: "Escalate to Finance Manager", case: "CAS-042", status: "Needs Approval", progress: 10, assigned: "Human (JD)" },
    { id: "ACT-838", title: "Review GSTR-1 Correction", case: "CAS-081", status: "Waiting", progress: 30, assigned: "Reconciliation Engine" },
  ]);

  const handleExecute = (id: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, status: "Running", progress: 50 } : a));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Action Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time monitoring of autonomous AI workflow execution.</p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {actions.map((act) => (
            <motion.div 
              key={act.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-xl p-5 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    act.status === 'Completed' ? 'bg-success/10 text-success' :
                    act.status === 'Running' ? 'bg-primary/10 text-primary' :
                    act.status === 'Needs Approval' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {act.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                     act.status === 'Running' ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{act.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">{act.id}</span>
                      <span>•</span>
                      <span>Case: {act.case}</span>
                      <span>•</span>
                      <span>Assigned: <span className="font-medium text-foreground">{act.assigned}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 min-w-[300px]">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span className={act.status === 'Running' ? 'text-primary' : 'text-muted-foreground'}>{act.status}</span>
                      <span className="text-muted-foreground">{act.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          act.status === 'Completed' ? 'bg-success' :
                          act.status === 'Needs Approval' ? 'bg-destructive' :
                          'bg-primary'
                        }`} 
                        style={{ width: `${act.progress}%` }} 
                      />
                    </div>
                  </div>
                  
                  {act.status === 'Queued' || act.status === 'Needs Approval' ? (
                    <Button size="sm" onClick={() => handleExecute(act.id)} className="shrink-0 bg-primary text-white shadow-sm">
                      <PlayCircle className="w-4 h-4 mr-1.5" />
                      Execute Now
                    </Button>
                  ) : act.status === 'Running' ? (
                    <Button size="sm" variant="outline" disabled className="shrink-0">
                      Processing...
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="shrink-0 text-muted-foreground">
                      View Log
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
