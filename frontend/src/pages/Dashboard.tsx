import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { AlertCircle, FileText, CheckCircle, TrendingUp, Users, ArrowUpRight, Search, ShieldAlert, FileWarning, ArrowRight, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [summary, setSummary] = useState<any>({});
  const [trends, setTrends] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, trendRes, vendRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/risk-trends"),
          api.get("/dashboard/vendor-analytics")
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
        setVendors(vendRes.data);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Track your GST compliance, vendor risks, and ITC status.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 w-full md:w-[300px] rounded-full bg-background/50 border-border/50" placeholder="Search invoices or vendors..." />
          </div>
          <Button 
            className="rounded-full shadow-lg shadow-primary/20"
            onClick={() => {
              toast.success("AI report generated successfully.");
              navigate("/reports");
            }}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {!loading && (summary.total_invoices ?? 0) === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-2xl border border-dashed border-primary/20"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <FileQuestion className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No GST files uploaded yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Upload your GSTR1 and GSTR2B CSV files to begin reconciliation and let GraphGST AI detect compliance risks.
          </p>
          <Button size="lg" onClick={() => navigate("/upload")}>
            Upload Data Now
          </Button>
        </motion.div>
      ) : (
        <>
          {/* KPI Cards */}
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <KpiCard
              title="Total Invoices"
              value={(summary.total_invoices ?? 0).toLocaleString()}
              icon={<FileText className="w-4 h-4 text-primary" />}
              trend="+12% from last month"
              loading={loading}
            />
            <KpiCard
              title="Matched Invoices"
              value={(summary.matched_invoices ?? 0).toLocaleString()}
              icon={<CheckCircle className="w-4 h-4 text-green-500" />}
              trend="88% match rate"
              loading={loading}
            />
            <KpiCard
              title="ITC At Risk"
              value={`₹${(summary.itc_at_risk ?? 0).toLocaleString()}`}
              icon={<TrendingUp className="w-4 h-4 text-destructive" />}
              trend="-2.4% from last month"
              loading={loading}
              alert
            />
            <KpiCard
              title="High Risk Vendors"
              value={summary.high_risk_vendors ?? 0}
              icon={<Users className="w-4 h-4 text-orange-500" />}
              trend="3 new this week"
              loading={loading}
            />
          </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Trend */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-2">
          <Card className="glass border-border/50 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Monthly Mismatch Trend</CardTitle>
              <CardDescription>Matched vs Mismatched invoices over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              {loading ? (
                <Skeleton className="w-full h-full min-h-[300px] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMatched" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMismatched" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="matched" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMatched)" strokeWidth={2} />
                    <Area type="monotone" dataKey="mismatched" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorMismatched)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Risky Vendors */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-1">
          <Card className="glass border-border/50 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Top Risk Vendors</CardTitle>
              <CardDescription>Vendors with highest non-compliance score</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              {loading ? (
                <Skeleton className="w-full h-full min-h-[300px] rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendors} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="risk_score" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section: AI & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vendor Compliance Table */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-2">
          <Card className="glass border-border/50 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Vendor Compliance Status</CardTitle>
                <CardDescription>Recent reconciliation results by vendor</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Vendor</th>
                      <th className="px-4 py-3">Invoices</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Risk Score</th>
                      <th className="px-4 py-3 rounded-tr-lg"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{v.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.mismatch_count} mismatches</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.risk_score > 50 ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-600'}`}>
                            {v.risk_score > 50 ? 'High Risk' : 'Medium Risk'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{v.risk_score}/100</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpRight className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI & Alerts */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-1 space-y-6">
          
          {/* AI Panel */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/20 border-primary/20 shadow-inner">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed mb-4">
                <strong>Vendor A</strong> has consistently failed to file GSTR-1 on time for the last 3 months, placing ₹1.2L of ITC at risk. 
              </p>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
                Hold Payments for Vendor A
              </Button>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="glass border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Missing Invoice Detected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">INV-2023-0104 not found in GSTR-2B.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                  <FileWarning className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Value Mismatch</p>
                  <p className="text-xs text-muted-foreground mt-0.5">₹4,500 variance found in Vendor C.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon, trend, loading, alert = false }: { title: string, value: any, icon: React.ReactNode, trend: string, loading: boolean, alert?: boolean }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={`glass border-border/50 shadow-sm overflow-hidden relative ${alert ? 'border-destructive/30' : ''}`}>
        {alert && <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${alert ? 'bg-destructive/10' : 'bg-primary/5'}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-1" />
          ) : (
            <div className={`text-3xl font-bold tracking-tight ${alert ? 'text-destructive' : ''}`}>{value || 0}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : null}
            {trend}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
