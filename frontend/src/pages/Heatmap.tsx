import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map } from "lucide-react";

export default function Heatmap() {
  const stateData = [
    { state: "Maharashtra", vendors: 145, risk: "High", itc: "₹45.2L", score: 65 },
    { state: "Karnataka", vendors: 98, risk: "Medium", itc: "₹12.4L", score: 82 },
    { state: "Delhi", vendors: 87, risk: "High", itc: "₹28.9L", score: 58 },
    { state: "Gujarat", vendors: 64, risk: "Low", itc: "₹4.1L", score: 94 },
    { state: "Tamil Nadu", vendors: 52, risk: "Medium", itc: "₹8.5L", score: 79 },
  ];

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
          <CardDescription>Click on a state to view associated high-risk vendors.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
              {stateData.map((s, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{s.state}</td>
                  <td className="px-6 py-4 text-muted-foreground">{s.vendors}</td>
                  <td className="px-6 py-4 font-medium">{s.itc}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${s.score > 80 ? 'bg-success' : s.score > 60 ? 'bg-warning' : 'bg-destructive'}`} 
                          style={{ width: `${s.score}%` }} 
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{s.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      s.risk === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      s.risk === 'Medium' ? 'bg-warning/10 text-warning-foreground border-warning/20' :
                      'bg-success/10 text-success border-success/20'
                    }`}>
                      {s.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
