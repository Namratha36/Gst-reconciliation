import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, TrendingUp, AlertTriangle, ShieldCheck, Table, Trash2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { reportService } from "@/services/reportService";
import { formatDate } from "@/services/format";
import type { Report } from "@/types/domain";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [sortKey, setSortKey] = useState<"title" | "generatedAt">("generatedAt");
  const [periodStart, setPeriodStart] = useState("2026-06-01");
  const [periodEnd, setPeriodEnd] = useState("2026-06-30");

  useEffect(() => {
    void reportService.listReports({ periodStart, periodEnd }).then(setReports);
  }, [periodStart, periodEnd]);

  const report = reports[0];
  // Normalise metrics — backend returns {label, value}, frontend type expects {id, title, value, trend}
  const normalizedMetrics = useMemo(() => {
    if (!report?.metrics) return [];
    return report.metrics.map((m: Record<string, unknown>, idx: number) => ({
      id: String(idx),
      title: (m.title ?? m.label ?? "Metric") as string,
      value: String(m.value ?? ""),
      trend: (m.trend ?? "") as string,
    }));
  }, [report]);

  const sortedMetrics = useMemo(() => {
    if (sortKey === "title") return [...normalizedMetrics].sort((a, b) => a.title.localeCompare(b.title));
    return normalizedMetrics;
  }, [normalizedMetrics, sortKey]);

  const handleDownloadPdf = () => {
    if (!report) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("GraphGST AI Enterprise", 14, 22);
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text(report.title ?? "Report", 14, 32);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Period: ${formatDate(report.periodStart)} to ${formatDate(report.periodEnd)}`, 14, 40);

      autoTable(doc, {
        startY: 55,
        head: [["Metric", "Value"]],
        body: normalizedMetrics.map((m) => [m.title, m.value]),
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
      });

      const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Compliance Summary", 14, finalY + 15);
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(doc.splitTextToSize(report.summary ?? "", 180), 14, finalY + 25);
      doc.save(`graphgst-report-${report.id.slice(0, 8)}.pdf`);
      toast.success("PDF report exported");
    } catch {
      toast.error("PDF export failed");
    }
  };

  const handleDownloadCsv = () => {
    if (!report) return;
    const csv = ["Metric,Value", ...normalizedMetrics.map((m) => `"${m.title}","${m.value}"`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `graphgst-report-${report.id.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV report exported");
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    try {
      await reportService.deleteReport(report.id);
      setReports((current) => current.filter((item) => item.id !== report.id));
      toast.success("Report deleted");
    } catch {
      toast.error("Could not delete report", { description: "The backend report delete endpoint is not available yet." });
    }
  };

  if (!report) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Executive Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">No reports returned by the backend for the selected range.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className="h-9 w-40" />
          <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} className="h-9 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Executive Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Historical summaries produced from backend case, vendor, action, and approval data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className="h-9 w-40" />
          <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} className="h-9 w-40" />
          <Button variant="outline" onClick={() => setSortKey(sortKey === "title" ? "generatedAt" : "title")}>
            <Table className="w-4 h-4 mr-2" />
            Sort: {sortKey === "title" ? "Title" : "Backend"}
          </Button>
          <Button variant="outline" onClick={() => void handleDeleteReport()} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" onClick={() => void handleDownloadCsv()}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => void handleDownloadPdf()} className="bg-primary text-white shadow-md">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard icon={<AlertTriangle className="w-4 h-4 mr-2 text-destructive" />} title={normalizedMetrics[2]?.title ?? "ITC At Risk"} value={String(normalizedMetrics[2]?.value ?? "Rs. 0")} note="Total ITC exposure" tone="destructive" />
        <SummaryCard icon={<ShieldCheck className="w-4 h-4 mr-2 text-success" />} title={normalizedMetrics[3]?.title ?? "High Risk Vendors"} value={String(normalizedMetrics[3]?.value ?? "0")} note="Vendors needing action" tone="success" />
        <SummaryCard icon={<TrendingUp className="w-4 h-4 mr-2 text-secondary" />} title={normalizedMetrics[0]?.title ?? "Active Cases"} value={String(normalizedMetrics[0]?.value ?? "0")} note="Open compliance cases" tone="secondary" />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <FileText className="w-4 h-4 mr-2 text-primary" />
            {report.title}
          </CardTitle>
          <CardDescription>{formatDate(report.periodStart)} to {formatDate(report.periodEnd)}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Metric</th>
                  <th className="px-4 py-3 text-left">Value</th>
                  <th className="px-4 py-3 text-left">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedMetrics.map((metric) => (
                   <tr key={metric.id}>
                     <td className="px-4 py-3 font-medium">{metric.title}</td>
                     <td className="px-4 py-3 font-semibold text-foreground">{metric.value}</td>
                     <td className="px-4 py-3 text-muted-foreground">{metric.trend || "—"}</td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, title, value, note, tone }: { icon: React.ReactNode; title: string; value: string; note: string; tone: "destructive" | "success" | "secondary" }) {
  const border = tone === "destructive" ? "border-l-destructive" : tone === "success" ? "border-l-success" : "border-l-secondary";
  return (
    <Card className={`shadow-sm border-l-4 ${border}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center text-muted-foreground">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground font-medium mt-1">{note}</p>
      </CardContent>
    </Card>
  );
}
