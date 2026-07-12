import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle2, PlayCircle, Loader2, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { actionService } from "@/services/actionService";
import type { CaseAction } from "@/types/domain";

export default function Actions() {
  const [actions, setActions] = useState<CaseAction[]>([]);
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  useEffect(() => {
    void actionService.listActions().then(setActions);
  }, []);

  const handleExecute = async (id: string) => {
    try {
      const updated = await actionService.updateStatus(id, "Running");
      setActions((current) => current.map((action) => (action.id === id ? updated : action)));
      toast.success("Action started");
    } catch {
      toast.error("Could not start action", { description: "The backend action endpoint is not available yet." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await actionService.deleteAction(id);
      setActions((current) => current.filter((action) => action.id !== id));
      toast.success("Action deleted");
    } catch {
      toast.error("Could not delete action", { description: "The backend delete endpoint is not available yet." });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Action Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Tasks created from cases, including status, progress, logs, owner, and timestamps.</p>
      </div>

      <div className="grid gap-4">
        {actions.length === 0 && <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No actions returned by the backend.</div>}
        <AnimatePresence>
          {actions.map((action) => (
            <motion.div key={action.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-lg p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconClass(action.status)}`}>
                    {action.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> : action.status === "Running" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{action.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">{action.id}</span>
                      <span>Case: {action.caseId}</span>
                      <span>Owner: <span className="font-medium text-foreground">{action.owner}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:min-w-[360px]">
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span className={action.status === "Running" ? "text-primary" : "text-muted-foreground"}>{action.status}</span>
                      <span className="text-muted-foreground">{action.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${action.status === "Completed" ? "bg-success" : action.status === "Needs Approval" ? "bg-destructive" : "bg-primary"}`} style={{ width: `${action.progress}%` }} />
                    </div>
                  </div>

                  {action.status === "Queued" || action.status === "Needs Approval" ? (
                    <Button size="sm" onClick={() => void handleExecute(action.id)} className="shrink-0 bg-primary text-white shadow-sm">
                      <PlayCircle className="w-4 h-4 mr-1.5" />
                      Execute Now
                    </Button>
                  ) : action.status === "Running" ? (
                    <Button size="sm" variant="outline" disabled className="shrink-0">Processing...</Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setOpenLogId(openLogId === action.id ? null : action.id)} className="shrink-0 text-muted-foreground">
                      <FileText className="w-4 h-4 mr-1.5" />
                      {openLogId === action.id ? "Hide Log" : "View Log"}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => void handleDelete(action.id)} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {openLogId === action.id && (
                <div className="mt-4 border-t pt-4 space-y-2">
                  {action.logs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No logs returned for this action.</p>
                  ) : action.logs.map((log) => (
                    <div key={log.id} className="text-xs text-muted-foreground">
                      <span className="font-mono text-foreground">{new Date(log.at).toLocaleString("en-IN")}</span> - {log.actor}: {log.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function iconClass(status: string) {
  if (status === "Completed") return "bg-success/10 text-success";
  if (status === "Running") return "bg-primary/10 text-primary";
  if (status === "Needs Approval") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
}
