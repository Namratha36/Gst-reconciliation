import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { ReconciliationException } from "@/types/domain";

export interface ReconciliationSummary {
  missingInvoices: number;
  valueMismatches: number;
  duplicateEntries: number;
}

export interface ReconciliationService {
  listExceptions(): Promise<ReconciliationException[]>;
  getSummary(): Promise<ReconciliationSummary>;
  runReconciliation(): Promise<ReconciliationException[]>;
}

const emptySummary: ReconciliationSummary = {
  missingInvoices: 0,
  valueMismatches: 0,
  duplicateEntries: 0,
};

export const reconciliationService: ReconciliationService = {
  async listExceptions() {
    return getOrEmpty<ReconciliationException[]>("/reconciliation/exceptions", []);
  },

  async getSummary() {
    return getOrEmpty<ReconciliationSummary>("/reconciliation/summary", emptySummary);
  },

  async runReconciliation() {
    const response = await api.post<ReconciliationException[] | { data: ReconciliationException[] }>("/reconciliation/run");
    return unwrap(response.data);
  },
};
