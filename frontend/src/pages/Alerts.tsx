import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

export default function Alerts() {
  const alerts = [
    { type: 'critical', title: 'Circular Trading Detected', msg: 'Graph analysis flagged a loop involving Vendor ABC and Alpha Corp.', time: '10 mins ago', icon: ShieldAlert },
    { type: 'warning', title: 'High ITC Exposure', msg: '₹24.5L blocked due to pending GSTR-1 from Apex Manufacturing.', time: '2 hours ago', icon: AlertTriangle },
    { type: 'success', title: 'GSTR-2B Ingested', msg: 'Successfully processed 14,203 invoices for June 2026.', time: '5 hours ago', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Smart Alerts Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time notifications from the AI reasoning engine.</p>
        </div>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <Bell className="w-4 h-4 mr-2 text-primary" />
            Recent Alerts
          </CardTitle>
          <CardDescription>AI-generated compliance and risk alerts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {alerts.map((a, i) => (
              <div key={i} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  a.type === 'critical' ? 'bg-destructive/10 text-destructive' :
                  a.type === 'warning' ? 'bg-warning/10 text-warning-foreground' :
                  'bg-success/10 text-success'
                }`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">{a.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{a.msg}</p>
                </div>
                <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {a.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
