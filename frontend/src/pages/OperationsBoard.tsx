import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { casesService, type CaseView, type OperationsColumn } from "@/services/casesService";
import { formatINR } from "@/services/format";
import { toast } from "sonner";

const columnColors: Record<string, string> = {
  Queued: "bg-slate-500",
  Planning: "bg-blue-500",
  Executing: "bg-indigo-500",
  Waiting: "bg-amber-500",
  Escalated: "bg-red-500",
  Resolved: "bg-emerald-500",
};

export default function OperationsBoard() {
  const [columns, setColumns] = useState<OperationsColumn[]>([]);

  useEffect(() => {
    void casesService.listOperationsColumns().then(setColumns);
  }, []);

  const handleDeleteCase = async (id: string) => {
    try {
      await casesService.deleteCase(id);
      setColumns((current) => current.map((column) => ({
        ...column,
        cases: column.cases.filter((item) => item.id !== id),
      })));
      toast.success("Case deleted");
    } catch {
      toast.error("Could not delete case", { description: "The backend delete endpoint is not available yet." });
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Operations Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Workflow state machine for case IDs created by reconciliation.</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.status} className="flex flex-col min-w-[280px] w-[280px] bg-muted/30 rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${columnColors[column.status]}`} />
                {column.status}
              </h3>
              <span className="text-xs font-mono font-medium bg-background border px-2 py-0.5 rounded-full text-muted-foreground">{column.cases.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {column.cases.map((item) => (
                <CaseCard key={item.id} data={item} onDelete={handleDeleteCase} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CaseCard({ data, onDelete }: { data: CaseView; onDelete: (id: string) => Promise<void> }) {
  const isCritical = data.priority === "Critical";
  const isHigh = data.priority === "High";

  return (
    <motion.div whileHover={{ y: -2 }} className={`bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all ${isCritical ? "border-destructive/40" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold text-muted-foreground">{data.id}</span>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isCritical ? "bg-destructive/10 text-destructive" : isHigh ? "bg-warning/10 text-warning" : "bg-secondary/10 text-secondary"}`}>
            {data.priority}
          </span>
          <Button variant="ghost" size="icon" onClick={() => void onDelete(data.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <h4 className="font-semibold text-sm text-foreground mb-1">{data.vendorName}</h4>
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 font-medium text-foreground">
          <AlertCircle className="w-3 h-3 text-muted-foreground" />
          {formatINR(data.itcAtRisk)}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className="truncate max-w-[90px]">{data.owner}</span>
        </div>
      </div>
    </motion.div>
  );
}
