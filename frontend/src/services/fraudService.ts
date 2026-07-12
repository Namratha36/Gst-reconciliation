import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { FraudNetwork } from "@/types/domain";

export interface FraudService {
  getNetwork(): Promise<FraudNetwork | null>;
  runDeepScan(): Promise<FraudNetwork>;
}

export const fraudService: FraudService = {
  async getNetwork() {
    return getOrEmpty<FraudNetwork | null>("/fraud/network", null);
  },

  async runDeepScan() {
    const response = await api.post<FraudNetwork | { data: FraudNetwork }>("/fraud/scan");
    return unwrap(response.data);
  },
};
