import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ShieldAlert, AlertTriangle, Info, Trash2 } from "lucide-react";
import { alertService } from "@/services/alertService";
import type { Alert } from "@/types/domain";
import { toast } from "sonner";

const icons = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    void alertService.listAlerts().then(setAlerts);
  }, []);

  const markAllRead = async () => {
    const ids = alerts.map((alert) => alert.id);
    if (ids.length === 0) return;
    try {
      await alertService.markAllRead(ids);
      setAlerts([]);
      toast.success("All alerts cleared");
    } catch {
      toast.error("Could not clear alerts", { description: "The backend mark-read endpoint is not available yet." });
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts((current) => current.filter((alert) => alert.id !== id));
      toast.success("Alert deleted");
    } catch {
      toast.error("Could not delete alert", { description: "The backend delete endpoint is not available yet." });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Smart Alerts Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Event notifications emitted from upload, reconciliation, case, graph, and approval stages.</p>
        </div>
        <Button variant="outline" onClick={() => void markAllRead()} disabled={alerts.length === 0}>Mark All as Read</Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <Bell className="w-4 h-4 mr-2 text-primary" />
            Recent Alerts
          </CardTitle>
          <CardDescription>Live notifications returned by the backend alert service.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No alerts returned by the backend.</div>
          ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const Icon = icons[alert.severity];
              return (
                <div key={alert.id} className={`p-4 flex flex-col sm:flex-row gap-4 hover:bg-muted/30 transition-colors ${alert.read ? "opacity-70" : ""}`}>
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${severityClass(alert.severity)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    {alert.entityId && <p className="text-xs font-mono text-muted-foreground mt-2">{alert.entityType}: {alert.entityId}</p>}
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">{new Date(alert.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    <Button variant="ghost" size="icon" onClick={() => void deleteAlert(alert.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function severityClass(severity: string) {
  if (severity === "critical") return "bg-destructive/10 text-destructive";
  if (severity === "warning") return "bg-warning/10 text-warning-foreground";
  if (severity === "success") return "bg-success/10 text-success";
  return "bg-primary/10 text-primary";
}
