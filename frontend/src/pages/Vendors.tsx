import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { vendorService } from "@/services/vendorService";
import { formatINR } from "@/services/format";
import type { Vendor } from "@/types/domain";

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    void vendorService.listVendors().then(setVendors);
  }, []);

  const handleSendNotice = () => {
    if (!selectedVendor) return;
    void vendorService.createNoticeApproval(selectedVendor.id)
      .then(() => {
        toast.success("Approval request created");
        setSelectedVendor(null);
      })
      .catch(() => {
        toast.error("Could not create approval request", { description: "The backend vendor notice endpoint is not available yet." });
      });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Intelligence Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Vendor analytics derived from cases, reconciliation status, and risk scoring.</p>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <Users className="w-4 h-4 mr-2 text-primary" />
            Vendor Risk Matrix
          </CardTitle>
          <CardDescription>Replaceable service data, ready for Supabase or REST-backed analytics.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Vendor Name</th>
                  <th className="px-6 py-3 font-medium">Compliance Score</th>
                  <th className="px-6 py-3 font-medium">Risk Tier</th>
                  <th className="px-6 py-3 font-medium">Pending Cases</th>
                  <th className="px-6 py-3 font-medium">ITC Exposure</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
              {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.gstin}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${vendor.complianceScore > 80 ? "bg-success" : vendor.complianceScore > 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${vendor.complianceScore}%` }} />
                        </div>
                        <span className="text-xs font-bold">{vendor.complianceScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${riskClass(vendor.riskTier)}`}>
                        {(vendor.riskTier === "High" || vendor.riskTier === "Critical") && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {vendor.riskTier === "Low" && <ShieldCheck className="w-3 h-3 mr-1" />}
                        {vendor.riskTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{vendor.pendingCaseCount}</td>
                    <td className="px-6 py-4 font-medium">{formatINR(vendor.itcExposure)}</td>
                    <td className="px-6 py-4 text-right">
                      {vendor.riskTier !== "Low" && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedVendor(vendor)} className="h-8 text-xs">
                          <Mail className="w-3 h-3 mr-1.5" />
                          Draft Notice
                        </Button>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          {vendors.length === 0 && <div className="p-6 text-sm text-muted-foreground">No vendors returned by the backend.</div>}
        </div>
        </CardContent>
      </Card>

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg border rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-foreground flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                Draft Compliance Notice
              </h3>
              <button onClick={() => setSelectedVendor(null)} className="text-muted-foreground hover:text-foreground">x</button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="To" value={selectedVendor.email} />
              <Field label="Subject" value="Urgent: GST reconciliation discrepancy" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Message Body</label>
                <div className="text-sm text-foreground bg-muted/20 p-4 rounded border whitespace-pre-wrap leading-relaxed h-40 overflow-y-auto font-mono text-[13px]">
                  Dear {selectedVendor.name} team,{"\n\n"}GraphGST AI identified pending reconciliation issues linked to your GSTIN {selectedVendor.gstin}. Please review the related filing and invoice data.{"\n\n"}This action will create an approval request before any email provider sends it.
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedVendor(null)}>Cancel</Button>
              <Button onClick={handleSendNotice} className="bg-primary text-white hover:bg-primary/90">Create Approval Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">{label}</label>
      <div className="text-sm font-medium bg-muted/50 px-3 py-2 rounded border border-transparent">{value}</div>
    </div>
  );
}

function riskClass(risk: string) {
  if (risk === "Critical" || risk === "High") return "bg-destructive/10 text-destructive border-destructive/20";
  if (risk === "Medium") return "bg-warning/10 text-warning-foreground border-warning/20";
  return "bg-success/10 text-success border-success/20";
}
