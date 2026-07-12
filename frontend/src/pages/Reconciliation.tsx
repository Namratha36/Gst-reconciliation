import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, FileWarning, Search, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { reconciliationService, type ReconciliationSummary } from "@/services/reconciliationService";
import { formatINR } from "@/services/format";
import type { ReconciliationException } from "@/types/domain";

export default function Reconciliation() {
  const [exceptions, setExceptions] = useState<ReconciliationException[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [exceptionData, summaryData] = await Promise.all([
        reconciliationService.listExceptions(),
        reconciliationService.getSummary(),
      ]);
      setExceptions(exceptionData);
      setSummary(summaryData);
      setLoading(false);
    }

    void fetchData();
  }, []);

  const filteredExceptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return exceptions;
    return exceptions.filter((item) => item.vendorName.toLowerCase().includes(normalized) || item.vendorGstin.toLowerCase().includes(normalized) || item.id.toLowerCase().includes(normalized));
  }, [exceptions, query]);

  const handleRunReconciliation = async () => {
    try {
      setLoading(true);
      const result = await reconciliationService.runReconciliation();
      setExceptions(result);
      setSummary(await reconciliationService.getSummary());
      toast.success("Reconciliation complete", { description: "Exceptions refreshed from reconciliation service." });
    } catch {
      toast.error("Could not run reconciliation", { description: "The backend reconciliation endpoint is not available yet." });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredExceptions.length === 0) return;

    const headers = ["Exception ID", "Vendor Name", "GSTIN", "Exception Type", "Impacted Amount", "Risk Grade", "Case ID"];
    const rows = filteredExceptions.map((item) => [
      item.id,
      item.vendorName,
      item.vendorGstin,
      item.exceptionType,
      item.impactedAmount,
      item.riskGrade,
      item.caseId ?? "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reconciliation_exceptions.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Exception export downloaded");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reconciliation Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">Invoice-level matching and exception management from one reconciliation service.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-9 shadow-sm bg-secondary text-white hover:bg-secondary/90" onClick={() => void handleRunReconciliation()}>
            Run Reconciliation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Missing Invoices" value={summary?.missingInvoices ?? 0} icon={<ShieldAlert className="w-4 h-4 text-destructive" />} alert />
        <KpiCard title="Value Mismatches" value={summary?.valueMismatches ?? 0} icon={<FileWarning className="w-4 h-4 text-warning" />} />
        <KpiCard title="Duplicate Entries" value={summary?.duplicateEntries ?? 0} icon={<FileWarning className="w-4 h-4 text-warning" />} />
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold">Exception Audit Log</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder="Search GSTIN or vendor..." className="pl-9 h-8 text-xs bg-background" />
            </div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleExport} disabled={filteredExceptions.length === 0}>
              <Download className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Vendor / GSTIN</th>
                    <th className="px-4 py-3 font-medium">Exception Type</th>
                    <th className="px-4 py-3 font-medium">Impacted Amount</th>
                    <th className="px-4 py-3 font-medium">Risk Grade</th>
                    <th className="px-4 py-3 font-medium text-right">Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExceptions.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.vendorName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.vendorGstin}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                          {item.exceptionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">{formatINR(item.impactedAmount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.riskGrade === "Critical" ? "bg-destructive" : "bg-warning"}`} />
                          <span className="text-xs font-medium">{item.riskGrade}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono text-muted-foreground">{item.caseId ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredExceptions.length === 0 && <div className="p-6 text-sm text-muted-foreground">No reconciliation exceptions returned by the backend.</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, alert = false }: { title: string; value: number; icon: React.ReactNode; alert?: boolean }) {
  return (
    <Card className={`shadow-sm overflow-hidden rounded-md border ${alert ? "border-destructive/40 bg-destructive/5" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`text-2xl font-semibold tracking-tight ${alert ? "text-destructive" : "text-foreground"}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
