import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map } from "lucide-react";
import { regionalExposureService } from "@/services/regionalExposureService";
import { formatINR } from "@/services/format";
import type { RegionalExposure } from "@/types/domain";

export default function Heatmap() {
  const [stateData, setStateData] = useState<RegionalExposure[]>([]);

  useEffect(() => {
    void regionalExposureService.listRegionalExposure().then(setStateData);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">State-Wise GST Heatmap</h1>
          <p className="text-sm text-muted-foreground mt-1">Geographical distribution of vendor risk and ITC exposure.</p>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <Map className="w-4 h-4 mr-2 text-primary" />
            Regional Exposure
          </CardTitle>
          <CardDescription>Regional analytics from the exposure service.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">State</th>
                  <th className="px-6 py-3 font-medium">Total Vendors</th>
                  <th className="px-6 py-3 font-medium">ITC Risk Exposure</th>
                  <th className="px-6 py-3 font-medium">Compliance Score</th>
                  <th className="px-6 py-3 font-medium">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stateData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.state}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.vendorCount}</td>
                    <td className="px-6 py-4 font-medium">{formatINR(item.itcExposure)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${item.complianceScore > 80 ? "bg-success" : item.complianceScore > 60 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${item.complianceScore}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{item.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${riskClass(item.riskTier)}`}>
                        {item.riskTier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function riskClass(risk: string) {
  if (risk === "Critical" || risk === "High") return "bg-destructive/10 text-destructive border-destructive/20";
  if (risk === "Medium") return "bg-warning/10 text-warning-foreground border-warning/20";
  return "bg-success/10 text-success border-success/20";
}
