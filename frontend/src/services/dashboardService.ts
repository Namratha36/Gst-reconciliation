import { getOrEmpty } from "@/services/http";
import type { Dashboard } from "@/types/domain";

export interface DashboardService {
  getDashboard(): Promise<Dashboard | null>;
}

export const dashboardService: DashboardService = {
  async getDashboard() {
    return getOrEmpty<Dashboard | null>("/dashboard", null);
  },
};
