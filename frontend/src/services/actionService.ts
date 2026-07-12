import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { ActionStatus, CaseAction } from "@/types/domain";

export interface ActionService {
  listActions(): Promise<CaseAction[]>;
  updateStatus(id: string, status: ActionStatus): Promise<CaseAction>;
  deleteAction(id: string): Promise<void>;
}

export const actionService: ActionService = {
  async listActions() {
    return getOrEmpty<CaseAction[]>("/actions", []);
  },

  async updateStatus(id, status) {
    const response = await api.patch<CaseAction | { data: CaseAction }>(`/actions/${id}`, { status });
    return unwrap(response.data);
  },

  async deleteAction(id) {
    await api.delete(`/actions/${id}`);
  },
};
