import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, FileWarning, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Reconciliation() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const vendRes = await api.get("/dashboard/vendor-analytics");
        setVendors(vendRes.data);
      } catch (e) {
        console.error("Failed to load reconciliation data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reconciliation Engine</h1>
          <p className="text-muted-foreground mt-1">Detailed breakdown of invoice mismatches and compliance risks.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20">Run Engine Again</Button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Missing Invoices" value="45" icon={<ShieldAlert className="w-4 h-4 text-destructive" />} alert />
        <KpiCard title="Amount Mismatches" value="₹24,500" icon={<FileWarning className="w-4 h-4 text-orange-500" />} />
        <KpiCard title="Duplicate Invoices" value="2" icon={<FileWarning className="w-4 h-4 text-yellow-500" />} />
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <Card className="glass border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Detailed Mismatch Log</CardTitle>
            <CardDescription>Comprehensive list of all identified anomalies.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Vendor</th>
                      <th className="px-4 py-3">Error Type</th>
                      <th className="px-4 py-3">Invoices Affected</th>
                      <th className="px-4 py-3">Risk Score</th>
                      <th className="px-4 py-3 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{v.name}</td>
                        <td className="px-4 py-3 text-destructive">GSTR-2B Missing</td>
                        <td className="px-4 py-3">{v.mismatch_count} invoices</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.risk_score > 50 ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-600'}`}>
                            {v.risk_score}/100
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm">Resolve</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function KpiCard({ title, value, icon, alert = false }: { title: string, value: any, icon: React.ReactNode, alert?: boolean }) {
  return (
    <Card className={`glass border-border/50 shadow-sm overflow-hidden relative ${alert ? 'border-destructive/30' : ''}`}>
      {alert && <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${alert ? 'bg-destructive/10' : 'bg-primary/5'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold tracking-tight ${alert ? 'text-destructive' : ''}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
