import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { AlertCircle, FileText, CheckCircle, TrendingUp, Users, Search, ShieldAlert, FileWarning, ArrowRight, FileQuestion, Activity, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [summary, setSummary] = useState<any>({});
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, vendRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/vendor-analytics")
        ]);
        setSummary(sumRes.data);
        setVendors(vendRes.data);
      } catch (e) {
        console.error("Failed to load dashboard data. Using mock data for Vercel demo.", e);
        setSummary({
          total_invoices: 14205,
          matched_invoices: 12500,
          itc_at_risk: 2450000,
          high_risk_vendors: 14
        });
        setVendors([
          { name: "Vendor A (High Risk)", risk_score: 85 },
          { name: "Vendor B (Medium Risk)", risk_score: 72 },
          { name: "Vendor C (Low Risk)", risk_score: 45 },
          { name: "Vendor D (Low Risk)", risk_score: 30 },
          { name: "Vendor E (Low Risk)", risk_score: 25 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Intelligence Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor GST compliance, structural risks, and vendor anomalies.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9">Export Audit Log</Button>
          <Button size="sm" className="h-9 shadow-sm" onClick={() => navigate("/reports")}>
            Generate Compliance Report
          </Button>
        </div>
      </div>

      {!loading && (summary.total_invoices ?? 0) === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-card rounded-md border shadow-sm">
          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No Data Available</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Initialize the system by uploading your GSTR1 and GSTR2B CSV files to begin reconciliation.
          </p>
          <Button onClick={() => navigate("/upload")}>
            Upload Data
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Invoices Processed"
              value={(summary.total_invoices ?? 0).toLocaleString()}
              icon={<FileText className="w-4 h-4 text-muted-foreground" />}
              trend="+12.5% vs last month"
              loading={loading}
            />
            <KpiCard
              title="Matched Invoices"
              value={(summary.matched_invoices ?? 0).toLocaleString()}
              icon={<CheckCircle className="w-4 h-4 text-success" />}
              trend="88% overall match rate"
              loading={loading}
            />
            <KpiCard
              title="ITC At Risk"
              value={`₹${(summary.itc_at_risk ?? 0).toLocaleString()}`}
              icon={<TrendingUp className="w-4 h-4 text-destructive" />}
              trend="Requires immediate review"
              loading={loading}
              alert
            />
            <KpiCard
              title="Flagged Vendors"
              value={summary.high_risk_vendors ?? 0}
              icon={<Users className="w-4 h-4 text-warning" />}
              trend="3 new flags today"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Vendor Risk Heatmap (Bar Chart acting as heatmap) */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Vendor Risk Matrix</CardTitle>
                      <CardDescription>Top vendors by non-compliance score</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">View Full Matrix <ArrowRight className="w-3 h-3 ml-1" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 min-h-[300px]">
                  {loading ? (
                    <Skeleton className="w-full h-[250px]" />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={vendors} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 500 }} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '4px', border: '1px solid hsl(var(--border))', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)', fontSize: '12px' }} />
                        <Bar dataKey="risk_score" barSize={16} radius={[0, 2, 2, 0]}>
                          {vendors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.risk_score > 70 ? 'hsl(var(--destructive))' : entry.risk_score > 40 ? 'hsl(var(--warning))' : 'hsl(var(--secondary))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Audit Timeline */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Audit Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-destructive mt-1.5" />
                        <div className="w-px h-full bg-border mt-2" />
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-medium text-foreground">High Risk Flag: Vendor A</p>
                        <p className="text-xs text-muted-foreground">System detected ₹1.2L ITC mismatch.</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Today, 09:41 AM</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
                        <div className="w-px h-full bg-border mt-2" />
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-medium text-foreground">Reconciliation Engine Completed</p>
                        <p className="text-xs text-muted-foreground">Processed 1,402 invoices successfully.</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Yesterday, 18:30 PM</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Data Ingestion: GSTR-2B</p>
                        <p className="text-xs text-muted-foreground">Admin JD uploaded monthly statement.</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Yesterday, 18:25 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: AI & System Logs */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* AI Findings Panel */}
              <Card className="shadow-sm border-l-4 border-l-secondary bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-secondary" />
                    Automated Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-relaxed text-muted-foreground mb-4">
                    Based on recent ingestion, <strong>Vendor A</strong> shows a pattern of late GSTR-1 filings. Holding payments is recommended to mitigate ₹1.2L ITC risk.
                  </p>
                  <Button size="sm" variant="outline" className="w-full text-xs h-8">
                    Review Entity
                  </Button>
                </CardContent>
              </Card>

              {/* Recent System Logs */}
              <Card className="shadow-sm flex-1">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-sm font-semibold">System Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                      <ShieldAlert className="w-4 h-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-xs font-medium">Anomaly Detected</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">INV-2023-0104 isolated from GSTR-2B sync.</p>
                      </div>
                    </div>
                    <div className="p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                      <FileWarning className="w-4 h-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-xs font-medium">Value Variance</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">₹4,500 mismatch in Vendor C record.</p>
                      </div>
                    </div>
                    <div className="p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <p className="text-xs font-medium">Graph Engine Synced</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Node relationships updated.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon, trend, loading, alert = false }: { title: string, value: any, icon: React.ReactNode, trend: string, loading: boolean, alert?: boolean }) {
  return (
    <Card className={`shadow-sm overflow-hidden rounded-md border ${alert ? 'border-destructive/40 bg-destructive/5' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <Skeleton className="h-7 w-20 mb-1" />
        ) : (
          <div className={`text-2xl font-semibold tracking-tight ${alert ? 'text-destructive' : 'text-foreground'}`}>{value || 0}</div>
        )}
        <p className="text-[11px] text-muted-foreground mt-1">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
