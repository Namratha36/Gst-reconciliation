import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, Clock, CheckCircle2, AlertCircle, FileText, 
  ArrowRight, Activity, ShieldAlert, Mail, Calendar, 
  RefreshCw, PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading AI state
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span className="text-xs font-semibold text-success tracking-wider uppercase">Agent Online & Monitoring</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Good Morning, Jane</h1>
          <p className="text-lg text-muted-foreground mt-1 font-medium flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-bold border border-primary/20">
              MISSION
            </span> 
            Recover ₹18.6L blocked ITC before July 20 filing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-background">
            <FileText className="w-4 h-4 mr-2" />
            Executive Summary
          </Button>
          <Button size="sm" className="bg-primary text-white shadow-sm">
            <Bot className="w-4 h-4 mr-2" />
            Ask Copilot
          </Button>
        </div>
      </div>

      {/* Progress & KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-card border rounded-xl shadow-sm p-5 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Today's Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="font-medium">12 cases resolved</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span className="font-medium">8 vendor emails sent</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-warning" />
              <span className="font-medium">6 reminders scheduled</span>
            </div>
            <div className="flex items-center gap-3 text-sm pt-2 border-t mt-2">
              <span className="font-bold text-success text-lg">₹3.2L</span>
              <span className="text-muted-foreground">ITC Recovered Today</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard title="Active Cases" value="42" trend="3 high priority" alert />
          <KpiCard title="ITC At Risk" value="₹18.6L" trend="Pending recovery" alert />
          <KpiCard title="Recoverable ITC" value="₹14.2L" trend="85% probability" />
          <KpiCard title="Resolution Rate" value="92%" trend="+4% this week" />
          <KpiCard title="Cases Closed" value="128" trend="This month" />
          <KpiCard title="Pending Approvals" value="2" trend="Requires human input" action="Review" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Currently Working Section */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary animate-spin-slow" />
            Agent is Currently Working On
          </h2>
          <div className="grid gap-3">
            <TaskCard 
              title="Monitoring Vendor ABC filing status" 
              status="Running" 
              icon={<Activity />} 
              time="Updated 2m ago" 
            />
            <TaskCard 
              title="Preparing executive report for CFO" 
              status="Running" 
              icon={<FileText />} 
              time="Updated 5m ago" 
            />
            <TaskCard 
              title="Waiting for Vendor XYZ response" 
              status="Waiting" 
              icon={<Clock />} 
              time="Due in 2 days" 
            />
            <TaskCard 
              title="Verifying corrected GSTR-1 invoices" 
              status="Completed" 
              icon={<CheckCircle2 />} 
              time="Just now" 
            />
            <TaskCard 
              title="Block payment for Nexus Imports" 
              status="Needs Approval" 
              icon={<ShieldAlert />} 
              time="Pending your review" 
              action="Approve"
            />
          </div>
        </div>

        {/* AI Activity Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Live Activity Feed
          </h2>
          <Card className="shadow-sm border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <TimelineItem time="09:20" title="Scheduled reminders" desc="3 follow-ups scheduled for high-risk vendors." agent="AI" />
                <TimelineItem time="09:12" title="Requested approval" desc="Escalation for Apex Mfg requires human review." agent="AI" highlight />
                <TimelineItem time="09:08" title="Drafted 12 emails" desc="Initial compliance notices drafted and queued." agent="AI" />
                <TimelineItem time="09:04" title="Recovery plans generated" desc="Strategies assigned to 42 open cases." agent="AI" />
                <TimelineItem time="09:02" title="124 cases created" desc="Anomalies converted into trackable cases." agent="AI" />
                <TimelineItem time="09:00" title="GST reconciliation completed" desc="Triggered by Jane Doe." agent="Human" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, alert, action }: any) {
  return (
    <Card className={`shadow-sm overflow-hidden rounded-xl border ${alert ? 'border-destructive/30 bg-destructive/5' : 'bg-card'}`}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-3xl font-bold tracking-tight ${alert ? 'text-destructive' : 'text-foreground'}`}>{value}</h3>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] font-medium text-muted-foreground">{trend}</p>
          {action && (
            <span className="text-[11px] font-semibold text-primary cursor-pointer hover:underline flex items-center gap-1">
              {action} <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskCard({ title, status, icon, time, action }: any) {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Running': return 'bg-primary/10 text-primary border-primary/20';
      case 'Waiting': return 'bg-warning/10 text-warning border-warning/20';
      case 'Completed': return 'bg-success/10 text-success border-success/20';
      case 'Needs Approval': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getStatusColor(status)} bg-opacity-50`}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {time}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {action && (
          <Button size="sm" className="h-8 text-xs bg-primary text-white">
            {action}
          </Button>
        )}
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </motion.div>
  );
}

function TimelineItem({ time, title, desc, agent, highlight }: any) {
  return (
    <div className={`p-4 flex gap-4 ${highlight ? 'bg-primary/5' : 'hover:bg-muted/30'} transition-colors`}>
      <div className="text-xs font-mono text-muted-foreground shrink-0 mt-1">{time}</div>
      <div className="flex flex-col relative w-full">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>{title}</h4>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${agent === 'AI' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {agent === 'AI' ? <Bot className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
            {agent}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
