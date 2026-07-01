import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Bot } from "lucide-react";

export default function Reports() {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const downloadCSV = async () => {
    window.open("http://localhost:8000/api/reports/csv", "_blank");
  };

  const generateAIReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/ai-compliance");
      setAiReport(res.data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Reports & Exports</h1>
      <p className="text-muted-foreground">Download your reconciliation results or generate AI compliance reports.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>Download raw reconciliation data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={downloadCSV} className="w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Download PDF (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Compliance Report</CardTitle>
            <CardDescription>Get actionable insights using Gemini AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={generateAIReport} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Bot className="w-4 h-4" /> {loading ? "Generating..." : "Generate AI Report"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {aiReport && (
        <Card className="mt-8 border-indigo-200 shadow-md">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="text-indigo-800 flex items-center gap-2">
              <Bot className="w-5 h-5" /> AI Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 prose max-w-none">
            {/* Extremely simple markdown renderer for demo */}
            {aiReport.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>
              if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold mt-4 mb-2">{line.replace('## ', '')}</h2>
              if (line.startsWith('- **')) {
                const parts = line.replace('- **', '').split('**');
                return <li key={i}><strong>{parts[0]}</strong>{parts[1]}</li>
              }
              if (line.match(/^\d+\.\s\*\*/)) {
                return <p key={i} className="ml-4 mt-2 font-medium">{line}</p>
              }
              return <p key={i}>{line}</p>
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
