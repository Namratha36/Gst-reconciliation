import { api } from "@/services/api";
import { getOrEmpty } from "@/services/http";
import type { Upload } from "@/types/domain";

export interface UploadResult {
  uploadIds: string[];
  message: string;
  pipelineRunId?: string;
}

export interface UploadService {
  listUploads(): Promise<Upload[]>;
  uploadGstFiles(files: File[]): Promise<UploadResult>;
  deleteUpload(id: string): Promise<void>;
}

export const uploadService: UploadService = {
  async listUploads() {
    return getOrEmpty<Upload[]>("/upload", []);
  },

  async uploadGstFiles(files) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post<UploadResult>("/upload/csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  async deleteUpload(id) {
    await api.delete(`/upload/${id}`);
  },
};
