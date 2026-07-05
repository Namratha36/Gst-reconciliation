import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, FileWarning, Search, Filter, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Reconciliation() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const vendRes = await api.get("/dashboard/vendor-analytics");
        setVendors(vendRes.data);
      } catch (e) {
        console.error("Failed to load reconciliation data. Using mock data for Vercel demo.", e);
        setVendors([
          { name: "Apex Manufacturing", mismatch_count: 54, risk_score: 85 },
          { name: "GlobalTech Solutions", mismatch_count: 12, risk_score: 65 },
          { name: "Nexus Imports", mismatch_count: 4, risk_score: 35 },
          { name: "Acme Logistics", mismatch_count: 2, risk_score: 20 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExport = () => {
    if (vendors.length === 0) return;
    
    const headers = ["Vendor Name", "Exception Type", "Impacted Amount", "Risk Grade"];
    const rows = vendors.map((item: any) => [
      item.name,
      "GSTR-2B Missing",
      (item.mismatch_count * 450),
      item.risk_score > 50 ? 'Critical' : 'Elevated'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_log_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Audit Log Exported", {
      description: "Your CSV file is downloading."
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reconciliation Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">Invoice-level matching and exception management.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            Filter Views
          </Button>
          <Button size="sm" className="h-9 shadow-sm bg-secondary text-white hover:bg-secondary/90">
            Run Reconciliation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Missing Invoices (GSTR-2B)" value="45" icon={<ShieldAlert className="w-4 h-4 text-destructive" />} alert />
        <KpiCard title="Value Mismatches" value="₹24,500" icon={<FileWarning className="w-4 h-4 text-warning" />} />
        <KpiCard title="Duplicate Entries" value="2" icon={<FileWarning className="w-4 h-4 text-warning" />} />
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Exception Audit Log</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="text" placeholder="Search GSTIN or Invoice..." className="pl-9 h-8 text-xs bg-background" />
            </div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleExport}>
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
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendors.map((v, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{v.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{`07AA${Math.random().toString(36).substring(2,8).toUpperCase()}1Z1`}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                          GSTR-2B Missing
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">₹ {(v.mismatch_count * 450).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${v.risk_score > 50 ? 'bg-destructive' : 'bg-warning'}`} />
                          <span className="text-xs font-medium">{v.risk_score > 50 ? 'Critical' : 'Elevated'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" className="h-7 text-xs">Investigate</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, alert = false }: { title: string, value: any, icon: React.ReactNode, alert?: boolean }) {
  return (
    <Card className={`shadow-sm overflow-hidden rounded-md border ${alert ? 'border-destructive/40 bg-destructive/5' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`text-2xl font-semibold tracking-tight ${alert ? 'text-destructive' : 'text-foreground'}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
