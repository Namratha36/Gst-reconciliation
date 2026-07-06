import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, ChevronRight, AlertCircle, Eye, FileUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Cases() {
  const [cases] = useState([
    {
      id: "CAS-104", vendor: "Nexus Imports", risk: 140000, impact: "Delayed Cashflow",
      priority: "Medium", deadline: "Today", owner: "AI Strategy", status: "Planning",
      confidence: 88, action: "Drafting compliance warning."
    },
    {
      id: "CAS-098", vendor: "Acme Logistics", risk: 540000, impact: "Blocked Capital",
      priority: "Critical", deadline: "Overdue", owner: "Comms Agent", status: "Executing",
      confidence: 94, action: "Dispatching final legal notice."
    },
    {
      id: "CAS-081", vendor: "Apex Mfg.", risk: 210000, impact: "ITC Mismatch",
      priority: "High", deadline: "Tomorrow", owner: "Vendor", status: "Waiting",
      confidence: 72, action: "Waiting for vendor GSTR-1 revision."
    },
    {
      id: "CAS-042", vendor: "Beta Industries", risk: 1200000, impact: "Severe Exposure",
      priority: "Critical", deadline: "Today", owner: "JD (Human)", status: "Escalated",
      confidence: 99, action: "Pending CFO review for payment hold."
    },
    {
      id: "CAS-011", vendor: "Zeta Corp", risk: 400000, impact: "None",
      priority: "High", deadline: "Resolved", owner: "System", status: "Resolved",
      confidence: 100, action: "ITC successfully matched & recovered."
    }
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Compliance Cases</h1>
          <p className="text-sm text-muted-foreground mt-1">Autonomous risk tracking and resolution workflows.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            Filter Views
          </Button>
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
            <span className="text-sm font-medium">All Open Cases (18)</span>
            <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">₹14.2L Total Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="text" placeholder="Search Case ID or Vendor..." className="pl-9 h-8 text-xs bg-background" />
            </div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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
                {cases.map((c, i) => (
                  <motion.tr 
                    key={c.id} 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-primary">{c.id}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{c.vendor}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-semibold">₹ {(c.risk).toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${c.priority === 'Critical' ? 'bg-destructive' : c.priority === 'High' ? 'bg-warning' : 'bg-secondary'}`} />
                        <span className="text-[10px] text-muted-foreground uppercase">{c.priority} Priority</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        c.status === 'Resolved' ? 'bg-success/10 text-success border-success/20' :
                        c.status === 'Escalated' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        c.status === 'Waiting' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {c.status}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        Owner: {c.owner}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${c.confidence > 90 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${c.confidence}%` }} />
                        </div>
                        <span className="text-xs font-mono">{c.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground max-w-[200px] truncate">{c.action}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Deadline: {c.deadline}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
