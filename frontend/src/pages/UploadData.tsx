import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, File, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "@/services/uploadService";
import type { Upload } from "@/types/domain";

export default function UploadData() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [uploading, setUploading] = useState(false);

  const refreshUploads = async () => {
    setUploads(await uploadService.listUploads());
  };

  useEffect(() => {
    void refreshUploads();
  }, []);

  const handleUpload = async () => {
    if (!files) return;
    setUploading(true);

    try {
      toast("Uploading files...", { description: "Ingesting CSV data into the pipeline." });
      const result = await uploadService.uploadGstFiles(Array.from(files));
      toast.success(result.message || "Ingestion successful. Data is now available for reconciliation.");
      setFiles(null);
      await refreshUploads();
    } catch (err) {
      toast.error("Upload failed", { description: "Invalid schema. Ensure files are GSTR1, GSTR2B, or GSTR3B CSVs." });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUpload = async (id: string) => {
    try {
      await uploadService.deleteUpload(id);
      setUploads((current) => current.filter((upload) => upload.id !== id));
      toast.success("Upload deleted");
    } catch {
      toast.error("Delete failed", { description: "The backend delete endpoint is not available yet." });
    }
  };

  return (
    <div className="max-w-4xl space-y-6 mx-auto">
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

      <Card className="shadow-sm border">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">Uploaded Files</CardTitle>
          <CardDescription>Files accepted by the backend ingestion pipeline.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {uploads.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No uploaded files returned by the backend yet.</div>
          ) : (
            <div className="divide-y">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{upload.fileName}</p>
                    <p className="text-xs text-muted-foreground">{upload.fileType} - {upload.status} - {upload.rowCount.toLocaleString()} rows</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void handleDeleteUpload(upload.id)} className="self-start sm:self-auto text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
