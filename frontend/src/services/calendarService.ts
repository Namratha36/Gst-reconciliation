import { getOrEmpty } from "@/services/http";
import type { ComplianceEvent } from "@/types/domain";

export interface CalendarService {
  listComplianceEvents(): Promise<ComplianceEvent[]>;
}

export const calendarService: CalendarService = {
  async listComplianceEvents() {
    return getOrEmpty<ComplianceEvent[]>("/calendar/compliance-events", []);
  },
};
