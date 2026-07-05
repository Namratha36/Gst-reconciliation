import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Vendors() {
  const vendors = [
    { name: "Vendor ABC Logistics", score: 42, risk: "High", itc: "₹24.5L", pending: 12, trend: "down" },
    { name: "XYZ Tech Solutions", score: 88, risk: "Low", itc: "₹5.2L", pending: 1, trend: "up" },
    { name: "Global Trade Co.", score: 65, risk: "Medium", itc: "₹12.1L", pending: 4, trend: "flat" },
    { name: "Apex Manufacturing", score: 38, risk: "High", itc: "₹45.8L", pending: 28, trend: "down" },
    { name: "Sunrise Exports", score: 94, risk: "Low", itc: "₹2.0L", pending: 0, trend: "up" },
  ];

  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const handleOpenNotice = (vendorName: string) => {
    setSelectedVendor(vendorName);
  };

  const handleSendNotice = () => {
    toast.success("Notice Sent Successfully", {
      description: `The compliance notice has been dispatched to ${selectedVendor} via GraphGST servers.`,
    });
    setSelectedVendor(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Intelligence Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor supplier compliance, risk scores, and ITC exposure.</p>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <Users className="w-4 h-4 mr-2 text-primary" />
            Vendor Risk Matrix
          </CardTitle>
          <CardDescription>Real-time compliance scoring based on GST filing history.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Vendor Name</th>
                <th className="px-6 py-3 font-medium">Compliance Score</th>
                <th className="px-6 py-3 font-medium">Risk Tier</th>
                <th className="px-6 py-3 font-medium">Pending Invoices</th>
                <th className="px-6 py-3 font-medium">ITC Exposure</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.map((v, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{v.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${v.score > 80 ? 'bg-success' : v.score > 50 ? 'bg-warning' : 'bg-destructive'}`} 
                          style={{ width: `${v.score}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold">{v.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      v.risk === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      v.risk === 'Medium' ? 'bg-warning/10 text-warning-foreground border-warning/20' :
                      'bg-success/10 text-success border-success/20'
                    }`}>
                      {v.risk === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {v.risk === 'Low' && <ShieldCheck className="w-3 h-3 mr-1" />}
                      {v.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{v.pending}</td>
                  <td className="px-6 py-4 font-medium">{v.itc}</td>
                  <td className="px-6 py-4 text-right">
                    {v.risk !== 'Low' && (
                      <Button variant="outline" size="sm" onClick={() => handleOpenNotice(v.name)} className="h-8 text-xs">
                        <Mail className="w-3 h-3 mr-1.5" />
                        Send Notice
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* In-App Email Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg border rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-foreground flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                Draft Compliance Notice
              </h3>
              <button onClick={() => setSelectedVendor(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">To</label>
                <div className="text-sm font-medium bg-muted/50 px-3 py-2 rounded border border-transparent">
                  contact@{selectedVendor.replace(/\s+/g, '').toLowerCase()}.com
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Subject</label>
                <div className="text-sm font-medium bg-muted/50 px-3 py-2 rounded border border-transparent">
                  Urgent: Pending GSTR-1 Filing & ITC Discrepancy
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Message Body</label>
                <div className="text-sm text-foreground bg-muted/20 p-4 rounded border whitespace-pre-wrap leading-relaxed h-40 overflow-y-auto font-mono text-[13px]">
                  Dear {selectedVendor} team,{"\n\n"}We have identified pending invoices causing an Input Tax Credit mismatch in our latest reconciliation.{"\n\n"}Please file your pending GSTR-1 returns immediately to avoid delayed payments.{"\n\n"}Thank you,{"\n"}GraphGST AI Compliance Team
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedVendor(null)}>Cancel</Button>
              <Button onClick={handleSendNotice} className="bg-primary text-white hover:bg-primary/90">
                Send via GraphGST Server
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
