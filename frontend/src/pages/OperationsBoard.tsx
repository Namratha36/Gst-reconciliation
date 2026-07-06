import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, AlertTriangle, Calendar, AlertCircle } from "lucide-react";

export default function OperationsBoard() {
  const [columns] = useState([
    {
      title: "Queued",
      count: 14,
      color: "bg-slate-500",
      cases: [
        { id: "CAS-104", vendor: "Nexus Imports", risk: "₹1.4L", priority: "Medium", agent: "AI Scanner" },
        { id: "CAS-105", vendor: "Alpha Co", risk: "₹0.8L", priority: "Low", agent: "AI Scanner" }
      ]
    },
    {
      title: "Planning",
      count: 8,
      color: "bg-blue-500",
      cases: [
        { id: "CAS-102", vendor: "GlobalTech", risk: "₹3.2L", priority: "High", agent: "Strategy Engine" }
      ]
    },
    {
      title: "Executing",
      count: 5,
      color: "bg-indigo-500",
      cases: [
        { id: "CAS-098", vendor: "Acme Logistics", risk: "₹5.4L", priority: "Critical", agent: "Comms Agent" }
      ]
    },
    {
      title: "Waiting",
      count: 12,
      color: "bg-amber-500",
      cases: [
        { id: "CAS-081", vendor: "Apex Mfg.", risk: "₹2.1L", priority: "High", agent: "Vendor Response" },
        { id: "CAS-079", vendor: "Sunrise Exports", risk: "₹0.5L", priority: "Low", agent: "Human Approval" }
      ]
    },
    {
      title: "Escalated",
      count: 3,
      color: "bg-red-500",
      cases: [
        { id: "CAS-042", vendor: "Beta Industries", risk: "₹12.0L", priority: "Critical", agent: "Finance Manager" }
      ]
    },
    {
      title: "Resolved",
      count: 124,
      color: "bg-emerald-500",
      cases: [
        { id: "CAS-011", vendor: "Zeta Corp", risk: "₹4.0L", priority: "High", agent: "System Closed" }
      ]
    }
  ]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Operations Board</h1>
        <p className="text-sm text-muted-foreground mt-1">Autonomous workflows mapping compliance case progression.</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map((col, idx) => (
          <div key={idx} className="flex flex-col min-w-[280px] w-[280px] bg-muted/30 rounded-xl p-3 border">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                {col.title}
              </h3>
              <span className="text-xs font-mono font-medium bg-background border px-2 py-0.5 rounded-full text-muted-foreground">
                {col.count}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {col.cases.map((c) => (
                <CaseCard key={c.id} data={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CaseCard({ data }: { data: any }) {
  const isCritical = data.priority === 'Critical';
  const isHigh = data.priority === 'High';

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`bg-card border rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all ${isCritical ? 'border-destructive/40' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold text-muted-foreground">{data.id}</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
          isCritical ? 'bg-destructive/10 text-destructive' : 
          isHigh ? 'bg-warning/10 text-warning' : 
          'bg-secondary/10 text-secondary'
        }`}>
          {data.priority}
        </span>
      </div>
      <h4 className="font-semibold text-sm text-foreground mb-1">{data.vendor}</h4>
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 font-medium text-foreground">
          <AlertCircle className="w-3 h-3 text-muted-foreground" />
          {data.risk} Risk
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className="truncate max-w-[80px]">{data.agent}</span>
        </div>
      </div>
    </motion.div>
  );
}
