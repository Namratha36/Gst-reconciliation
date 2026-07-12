import { getOrEmpty } from "@/services/http";
import type { RegionalExposure } from "@/types/domain";

export interface RegionalExposureService {
  listRegionalExposure(): Promise<RegionalExposure[]>;
}

export const regionalExposureService: RegionalExposureService = {
  async listRegionalExposure() {
    return getOrEmpty<RegionalExposure[]>("/analytics/regional-exposure", []);
  },
};
