import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Search, AlertTriangle, ShieldAlert } from "lucide-react";
import { fraudService } from "@/services/fraudService";
import type { FraudNetwork } from "@/types/domain";

export default function Fraud() {
  const [network, setNetwork] = useState<FraudNetwork | null>(null);

  useEffect(() => {
    void fraudService.getNetwork().then(setNetwork);
  }, []);

  const runDeepScan = async () => {
    try {
      setNetwork(await fraudService.runDeepScan());
    } catch {
      setNetwork(null);
    }
  };

  if (!network) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-destructive" />
            Fraud Network Detection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">No fraud network data returned by the backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-destructive" />
            Fraud Network Detection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Graph-derived detection of circular trading and suspicious vendor networks.</p>
        </div>
        <Button className="bg-destructive text-white hover:bg-destructive/90 shadow-md" onClick={() => void runDeepScan()}>
          <Search className="w-4 h-4 mr-2" />
          Run Deep Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-sm border-destructive/20 h-[600px] flex flex-col">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center">
                <Network className="w-4 h-4 mr-2 text-primary" />
                Live Network Topology
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center bg-muted/5">
              <div className="text-center p-6 border-2 border-dashed border-destructive/30 rounded-lg bg-destructive/5 max-w-md">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{network.clusterTitle}</h3>
                <p className="text-sm text-muted-foreground mb-4">{network.clusterDescription}</p>
                <div className="flex flex-col gap-2 text-left bg-background p-4 rounded-md border shadow-sm">
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Involved GSTINs:</div>
                  {network.involvedGstins.map((item) => (
                    <code key={item.gstin} className={`text-xs font-mono px-2 py-1 rounded ${item.severity === "critical" ? "text-destructive bg-destructive/10" : "text-warning-foreground bg-warning/10"}`}>
                      {item.gstin} ({item.label})
                    </code>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Active Threats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {network.threats.map((threat) => (
                <div key={threat.id} className={`p-3 border rounded-md ${threat.severity === "critical" ? "bg-destructive/10 border-destructive/20" : "bg-warning/10 border-warning/20"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${threat.severity === "critical" ? "bg-destructive animate-pulse" : "bg-warning"}`} />
                    <span className={`text-xs font-bold ${threat.severity === "critical" ? "text-destructive" : "text-warning-foreground"}`}>{threat.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{threat.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Fraud Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-destructive">{network.score.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground mb-1">/ 10</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-destructive" style={{ width: `${network.score * 10}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Overall platform risk is currently elevated.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
