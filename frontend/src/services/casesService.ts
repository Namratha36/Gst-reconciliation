import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { CaseStatus, ComplianceCase } from "@/types/domain";

export interface CaseView extends ComplianceCase {
  vendorName: string;
  vendorGstin: string;
}

export interface OperationsColumn {
  status: CaseStatus;
  cases: CaseView[];
}

export interface CasesService {
  listCases(): Promise<CaseView[]>;
  listOperationsColumns(): Promise<OperationsColumn[]>;
  getCase(id: string): Promise<CaseView | undefined>;
  updateStatus(id: string, status: CaseStatus): Promise<CaseView>;
  deleteCase(id: string): Promise<void>;
}

const statuses: CaseStatus[] = ["Queued", "Planning", "Executing", "Waiting", "Escalated", "Resolved"];

export const casesService: CasesService = {
  async listCases() {
    return getOrEmpty<CaseView[]>("/cases", []);
  },

  async listOperationsColumns() {
    const cases = await this.listCases();
    return statuses.map((status) => ({
      status,
      cases: cases.filter((item) => item.status === status),
    }));
  },

  async getCase(id) {
    try {
      const response = await api.get<CaseView | { data: CaseView }>(`/cases/${id}`);
      return unwrap(response.data);
    } catch {
      return undefined;
    }
  },

  async updateStatus(id, status) {
    const response = await api.patch<CaseView | { data: CaseView }>(`/cases/${id}/status`, { status });
    return unwrap(response.data);
  },

  async deleteCase(id) {
    await api.delete(`/cases/${id}`);
  },
};
