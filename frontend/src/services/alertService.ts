import { api } from "@/services/api";
import { getOrEmpty } from "@/services/http";
import type { Alert } from "@/types/domain";

export interface AlertService {
  listAlerts(): Promise<Alert[]>;
  markAllRead(alertIds: string[]): Promise<void>;
  deleteAlert(id: string): Promise<void>;
  deleteAllAlerts(alertIds: string[]): Promise<void>;
}

export const alertService: AlertService = {
  async listAlerts() {
    return getOrEmpty<Alert[]>("/alerts", []);
  },

  async markAllRead(alertIds) {
    await api.post("/alerts/mark-read", { alertIds });
  },

  async deleteAlert(id) {
    await api.delete(`/alerts/${id}`);
  },

  async deleteAllAlerts(alertIds) {
    await api.post("/alerts/delete", { alertIds });
  },
};
