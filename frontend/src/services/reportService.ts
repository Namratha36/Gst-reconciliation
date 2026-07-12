import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { Report } from "@/types/domain";

export interface ReportFilter {
  periodStart?: string;
  periodEnd?: string;
  vendorId?: string;
  caseStatus?: string;
}

export interface ReportExportRequest {
  reportId: string;
  format: "pdf" | "csv";
}

export interface ReportExportResult {
  downloadUrl?: string;
  expiresAt?: string;
}

export interface ReportService {
  listReports(filter?: ReportFilter): Promise<Report[]>;
  exportReport(request: ReportExportRequest): Promise<ReportExportResult>;
  deleteReport(reportId: string): Promise<void>;
}

export const reportService: ReportService = {
  async listReports(filter) {
    return getOrEmpty<Report[]>("/reports", []).then((reports) => {
      if (!filter?.periodStart && !filter?.periodEnd) return reports;
      return reports.filter((report) => {
        const startsAfter = !filter.periodStart || report.periodEnd >= filter.periodStart;
        const endsBefore = !filter.periodEnd || report.periodStart <= filter.periodEnd;
        return startsAfter && endsBefore;
      });
    });
  },

  async exportReport(request) {
    const response = await api.post<ReportExportResult | { data: ReportExportResult }>("/reports/export", request);
    return unwrap(response.data);
  },

  async deleteReport(reportId) {
    await api.delete(`/reports/${reportId}`);
  },
};
