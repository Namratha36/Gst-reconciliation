import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function UploadData() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!files) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      toast("Uploading files...", { description: "Ingesting CSV data into the pipeline." });
      await api.post("/upload/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Ingestion successful. Data is now available for reconciliation.");
      setFiles(null);
    } catch (err) {
      toast.error("Upload failed", { description: "Invalid schema. Ensure files are GSTR1, GSTR2B, or GSTR3B CSVs." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Data Ingestion</h1>
        <p className="text-sm text-muted-foreground mt-1">Securely upload GST return files to initialize the reconciliation pipeline.</p>
      </div>
      
      <Card className="shadow-sm border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">File Upload</CardTitle>
          <CardDescription>Supported formats: .csv only. Max file size: 50MB.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="border-2 border-dashed border-border rounded-md p-10 text-center bg-muted/30 transition-colors hover:bg-muted/50">
            <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <div>
              <label htmlFor="file-upload" className="cursor-pointer text-sm font-semibold text-secondary hover:underline">
                Browse Files
              </label>
              <input 
                id="file-upload" 
                type="file" 
                multiple 
                accept=".csv" 
                className="hidden" 
                onChange={(e) => setFiles(e.target.files)} 
              />
              <span className="text-sm text-muted-foreground ml-1">or drag and drop</span>
            </div>
          </div>
          
          {files && files.length > 0 && (
            <div className="border rounded-md p-4 bg-background space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Selected Files</h3>
              {Array.from(files).map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <File className="w-4 h-4 text-secondary" />
                  <span className="font-medium">{f.name}</span>
                  <span className="text-muted-foreground text-xs">({(f.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Data is encrypted at rest and in transit.
            </div>
            <Button onClick={handleUpload} disabled={!files || uploading} className="h-9 w-32 bg-secondary hover:bg-secondary/90 text-white">
              {uploading ? "Ingesting..." : "Start Ingestion"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
