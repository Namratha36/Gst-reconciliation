import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, AlertCircle, Eye, FileUp, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { casesService, type CaseView } from "@/services/casesService";
import { formatINR, relativeDateLabel } from "@/services/format";
import { toast } from "sonner";

export default function Cases() {
  const [cases, setCases] = useState<CaseView[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void casesService.listCases().then(setCases);
  }, []);

  const filteredCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cases;
    return cases.filter((item) => item.id.toLowerCase().includes(normalized) || item.vendorName.toLowerCase().includes(normalized));
  }, [cases, query]);

  const openCases = filteredCases.filter((item) => item.status !== "Resolved");
  const totalRisk = openCases.reduce((sum, item) => sum + item.itcAtRisk, 0);

  const exportCases = () => {
    const rows = filteredCases.map((item) => [item.id, item.vendorName, item.vendorGstin, item.status, item.priority, item.itcAtRisk, item.nextActionId ?? ""]);
    const csv = [["Case ID", "Vendor", "GSTIN", "Status", "Priority", "ITC At Risk", "Next Action"], ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "compliance_cases.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteCase = async (id: string) => {
    try {
      await casesService.deleteCase(id);
      setCases((current) => current.filter((item) => item.id !== id));
      toast.success("Case deleted");
    } catch {
      toast.error("Could not delete case", { description: "The backend delete endpoint is not available yet." });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Compliance Cases</h1>
          <p className="text-sm text-muted-foreground mt-1">Every reconciliation issue, keyed by backend case IDs and linked invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/upload">
            <Button size="sm" className="h-9 shadow-sm bg-primary text-white hover:bg-primary/90">
              <FileUp className="w-4 h-4 mr-2" />
              Upload GST Data
            </Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-sm border">
        <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Open Cases ({openCases.length})</span>
            <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{formatINR(totalRisk)} Total Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder="Search Case ID or Vendor..." className="pl-9 h-8 text-xs bg-background" />
            </div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={exportCases} disabled={filteredCases.length === 0}>
              <Download className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Case ID & Vendor</th>
                  <th className="px-4 py-3 font-medium">ITC Risk</th>
                  <th className="px-4 py-3 font-medium">Status & Owner</th>
                  <th className="px-4 py-3 font-medium">AI Confidence</th>
                  <th className="px-4 py-3 font-medium">Next Action</th>
                  <th className="px-4 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCases.map((item, index) => (
                  <motion.tr key={item.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-primary">{item.id}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{item.vendorName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.vendorGstin}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-semibold">{formatINR(item.itcAtRisk)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.priority === "Critical" ? "bg-destructive" : item.priority === "High" ? "bg-warning" : "bg-secondary"}`} />
                        <span className="text-[10px] text-muted-foreground uppercase">{item.priority} Priority</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusClass(item.status)}`}>{item.status}</span>
                      <p className="text-[11px] text-muted-foreground mt-1">Owner: {item.owner}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${item.confidence > 90 ? "bg-success" : "bg-warning"}`} style={{ width: `${item.confidence}%` }} />
                        </div>
                        <span className="text-xs font-mono">{item.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground max-w-[220px] truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Deadline: {relativeDateLabel(item.deadline)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void deleteCase(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredCases.length === 0 && <div className="p-6 text-sm text-muted-foreground">No cases returned by the backend.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "Resolved") return "bg-success/10 text-success border-success/20";
  if (status === "Escalated") return "bg-destructive/10 text-destructive border-destructive/20";
  if (status === "Waiting") return "bg-warning/10 text-warning border-warning/20";
  return "bg-primary/10 text-primary border-primary/20";
}
