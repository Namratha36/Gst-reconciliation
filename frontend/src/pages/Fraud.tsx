import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Search, AlertTriangle, ShieldAlert } from "lucide-react";

export default function Fraud() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-destructive" />
            Fraud Network Detection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered detection of circular trading and suspicious vendor networks.</p>
        </div>
        <Button className="bg-destructive text-white hover:bg-destructive/90 shadow-md">
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
                <h3 className="text-lg font-bold text-foreground mb-2">High-Risk Cluster Detected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The network scanner has identified a suspicious cluster involving 4 vendors in a potential circular trading loop.
                </p>
                <div className="flex flex-col gap-2 text-left bg-background p-4 rounded-md border shadow-sm">
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Involved GSTINs:</div>
                  <code className="text-xs text-destructive font-mono bg-destructive/10 px-2 py-1 rounded">27AADCB2230M1Z2 (Vendor ABC)</code>
                  <code className="text-xs text-warning-foreground font-mono bg-warning/10 px-2 py-1 rounded">27JJKCB3340M1Z3 (Alpha Corp)</code>
                  <code className="text-xs text-warning-foreground font-mono bg-warning/10 px-2 py-1 rounded">27XXYCB4450M1Z4 (Beta Log)</code>
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
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-bold text-destructive">Circular Trading</span>
                </div>
                <p className="text-xs text-muted-foreground">Detected loop between ABC, Alpha, and Beta.</p>
              </div>
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-xs font-bold text-warning-foreground">Repeated Patterns</span>
                </div>
                <p className="text-xs text-muted-foreground">Exact value invoices generated consecutively by XYZ Tech.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Fraud Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-destructive">8.4</span>
                <span className="text-sm text-muted-foreground mb-1">/ 10</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-destructive w-[84%]" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Overall platform risk is currently elevated.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
