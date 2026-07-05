import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // Primary Blue
      doc.text("GraphGST AI Enterprise", 14, 22);
      
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text("Executive GST Compliance Report", 14, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Muted
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);

      // Summary Section
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("1. Financial Summary", 14, 55);
      
      autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value', 'Status']],
        body: [
          ['Total Financial Exposure', '₹86.5L', 'Critical'],
          ['Overall Compliance Score', '84%', 'Warning'],
          ['Recovery Opportunities', '₹22.1L', 'Actionable'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
      });

      // AI Analysis Text
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("2. AI Compliance Overview", 14, finalY + 15);
      
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const splitText = doc.splitTextToSize(
        "The overall GST compliance score stands at 84%. While the majority of Input Tax Credit (ITC) has been successfully reconciled, a significant financial exposure of ₹86.5L remains due to 12 high-risk vendors failing to file their GSTR-1 returns within the stipulated timeline. Network analysis has identified a circular trading pattern originating from 'Vendor ABC' in the Maharashtra region. It is highly recommended to withhold payments totaling ₹24.5L to this vendor until compliance is verified.",
        180
      );
      doc.text(splitText, 14, finalY + 25);

      // Download
      doc.save("GST_Health_Report.pdf");
      toast.success("Executive Report Downloaded", {
        description: "Your PDF has been saved successfully.",
      });
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Executive Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate comprehensive compliance and financial exposure reports.</p>
        </div>
        <Button onClick={handleDownload} className="bg-primary text-white shadow-md">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center text-muted-foreground">
              <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
              Financial Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹86.5L</div>
            <p className="text-xs text-destructive font-medium mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mr-2 text-success" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">84%</div>
            <p className="text-xs text-success font-medium mt-1">Target: 95%</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2 text-secondary" />
              Recovery Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹22.1L</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Pending GSTR-1 filings</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <FileText className="w-4 h-4 mr-2 text-primary" />
            Executive Summary Preview
          </CardTitle>
          <CardDescription>AI-generated summary of your current GST health.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
          <h3 className="text-lg font-semibold mb-2">Q3 Compliance Overview</h3>
          <p className="text-muted-foreground mb-4">
            The overall GST compliance score stands at 84%. While the majority of Input Tax Credit (ITC) has been successfully reconciled, a significant financial exposure of ₹86.5L remains due to 12 high-risk vendors failing to file their GSTR-1 returns within the stipulated timeline.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">High-Risk Clusters</h3>
          <p className="text-muted-foreground mb-4">
            Network analysis has identified a circular trading pattern originating from 'Vendor ABC' in the Maharashtra region. It is highly recommended to withhold payments totaling ₹24.5L to this vendor until compliance is verified.
          </p>

          <h3 className="text-lg font-semibold mb-2">Action Items</h3>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Send automated compliance notices to the top 5 non-compliant vendors.</li>
            <li>Initiate ITC recovery procedures for ₹22.1L backed by missing GSTR-2B invoices.</li>
            <li>Review the risk grade of 3 newly onboarded vendors in the Gujarat sector.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
