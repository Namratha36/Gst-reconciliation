import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

export default function UploadData() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!files) return;
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      toast("Uploading files...", { description: "Please wait while we process your CSV files." });
      await api.post("/upload/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Files uploaded successfully!");
      setMessage("Files uploaded successfully! Background processing initiated.");
    } catch (err) {
      toast.error("Upload failed", { description: "Please ensure they are GSTR1, GSTR2B, or GSTR3B CSVs." });
      setMessage("Failed to upload files. Please ensure they are GSTR1, GSTR2B, or GSTR3B CSVs.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Upload GST Returns</h1>
      <p className="text-muted-foreground">Upload your GSTR1, GSTR2B, and GSTR3B CSV files to begin the reconciliation process.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>CSV Upload</CardTitle>
          <CardDescription>Select one or more files to upload.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center space-y-4 hover:bg-muted/50 transition-colors">
            <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <label htmlFor="file-upload" className="cursor-pointer text-primary font-semibold hover:underline">
                Click to browse
              </label>
              <input 
                id="file-upload" 
                type="file" 
                multiple 
                accept=".csv" 
                className="hidden" 
                onChange={(e) => setFiles(e.target.files)} 
              />
              <p className="text-sm text-muted-foreground mt-1">or drag and drop here</p>
            </div>
          </div>
          
          {files && files.length > 0 && (
            <div className="text-sm">
              <p className="font-semibold mb-2">Selected files:</p>
              <ul className="list-disc pl-5">
                {Array.from(files).map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!files || uploading} className="w-full">
            {uploading ? "Uploading..." : "Start Processing"}
          </Button>

          {message && <p className="text-sm font-semibold mt-2">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
