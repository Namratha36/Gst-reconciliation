import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { SimulationScenario } from "@/types/domain";

export interface SimulationService {
  listScenarios(): Promise<SimulationScenario[]>;
  runScenario(id: string): Promise<SimulationScenario>;
}

export const simulationService: SimulationService = {
  async listScenarios() {
    return getOrEmpty<SimulationScenario[]>("/simulations", []);
  },

  async runScenario(id) {
    const response = await api.post<SimulationScenario | { data: SimulationScenario }>(`/simulations/${id}/run`);
    return unwrap(response.data);
  },
};
