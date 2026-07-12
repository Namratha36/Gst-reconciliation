import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Clock, FileText, ArrowRight, Activity, ShieldAlert, RefreshCw, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboardService";
import { actionService } from "@/services/actionService";
import { alertService } from "@/services/alertService";
import { formatDate } from "@/services/format";
import type { Alert, CaseAction, Dashboard as DashboardModel } from "@/types/domain";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardModel | null>(null);
  const [actions, setActions] = useState<CaseAction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      const [dashboardData, actionData, alertData] = await Promise.all([
        dashboardService.getDashboard(),
        actionService.listActions(),
        alertService.listAlerts(),
      ]);

      if (!mounted) return;
      setDashboard(dashboardData);
      setActions(dashboardData ? actionData.filter((action) => dashboardData.currentActionIds.includes(action.id)) : []);
      setAlerts(dashboardData ? alertData.filter((alert) => dashboardData.recentAlertIds.includes(alert.id)) : []);
      setLoading(false);
    }

    void loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="h-64 rounded-lg border bg-card animate-pulse" />;
  }

  if (!dashboard) {
    return (
      <div className="max-w-7xl mx-auto rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        No dashboard data returned by the backend. Upload GST files or connect `/api/dashboard`.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
            </span>
            <span className="text-xs font-semibold text-success tracking-wider uppercase">Pipeline Online</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mission Control</h1>
          <p className="text-lg text-muted-foreground mt-1 font-medium flex flex-wrap items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-bold border border-primary/20">MISSION</span>
            {dashboard.mission.title} by {formatDate(dashboard.mission.targetDate)}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/reports">
            <Button variant="outline" size="sm" className="bg-background">
              <FileText className="w-4 h-4 mr-2" />
              Executive Summary
            </Button>
          </Link>
          <Link to="/copilot">
            <Button size="sm" className="bg-primary text-white shadow-sm">
              <Bot className="w-4 h-4 mr-2" />
              Ask Copilot
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-card border rounded-lg shadow-sm p-5 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Mission Recovery</h3>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-success text-2xl">Rs. {(dashboard.mission.recoveredToday / 100000).toFixed(1)}L</span>
            <span className="text-sm text-muted-foreground">recovered today</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Target: Rs. {(dashboard.mission.itcTarget / 100000).toFixed(1)}L by {formatDate(dashboard.mission.targetDate)}</p>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          {dashboard.metrics.map((metric) => (
            <KpiCard key={metric.id} title={metric.title} value={metric.value} trend={metric.trend} alert={metric.severity === "critical"} action={metric.actionLabel} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
            Workflow State From Cases
          </h2>
          <div className="grid gap-3">
            {actions.length === 0 && <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">No current actions returned by the backend.</div>}
            {actions.map((action) => (
              <TaskCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Live Activity Feed
          </h2>
          <Card className="shadow-sm border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {alerts.length === 0 && <div className="p-4 text-sm text-muted-foreground">No recent alerts returned by the backend.</div>}
                {alerts.map((alert) => (
                  <TimelineItem key={alert.id} alert={alert} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, alert, action }: { title: string; value: string; trend: string; alert?: boolean; action?: string }) {
  return (
    <Card className={`shadow-sm overflow-hidden rounded-lg border ${alert ? "border-destructive/30 bg-destructive/5" : "bg-card"}`}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-3xl font-bold tracking-tight ${alert ? "text-destructive" : "text-foreground"}`}>{value}</h3>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] font-medium text-muted-foreground">{trend}</p>
          {action && (
            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
              {action} <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskCard({ action }: { action: CaseAction }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running": return "bg-primary/10 text-primary border-primary/20";
      case "Waiting": return "bg-warning/10 text-warning border-warning/20";
      case "Completed": return "bg-success/10 text-success border-success/20";
      case "Needs Approval": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getStatusColor(action.status)}`}>
          {action.status === "Needs Approval" ? <ShieldAlert className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">{action.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Case {action.caseId} - {action.owner}
          </p>
        </div>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border self-start sm:self-auto ${getStatusColor(action.status)}`}>
        {action.status}
      </span>
    </motion.div>
  );
}

function TimelineItem({ alert }: { alert: Alert }) {
  return (
    <div className={`${alert.severity === "critical" ? "bg-primary/5" : "hover:bg-muted/30"} p-4 flex gap-4 transition-colors`}>
      <div className="text-xs font-mono text-muted-foreground shrink-0 mt-1">{new Date(alert.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
      <div className="flex flex-col relative w-full">
        <div className="flex items-center justify-between gap-3">
          <h4 className={`text-sm font-semibold ${alert.severity === "critical" ? "text-primary" : "text-foreground"}`}>{alert.title}</h4>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 bg-primary/10 text-primary">
            <PlayCircle className="w-3 h-3" />
            System
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
      </div>
    </div>
  );
}
