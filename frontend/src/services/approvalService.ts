import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { Approval, ApprovalStatus } from "@/types/domain";

export interface ApprovalService {
  listPendingApprovals(): Promise<Approval[]>;
  decideApproval(id: string, status: Extract<ApprovalStatus, "Approved" | "Rejected">): Promise<Approval>;
}

export const approvalService: ApprovalService = {
  async listPendingApprovals() {
    return getOrEmpty<Approval[]>("/approvals?status=Pending", []);
  },

  async decideApproval(id, status) {
    const response = await api.post<Approval | { data: Approval }>(`/approvals/${id}/decision`, {
      decision: status === "Approved" ? "Approve" : "Reject",
    });
    return unwrap(response.data);
  },
};
