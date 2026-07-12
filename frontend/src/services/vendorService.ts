import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { Approval, Vendor } from "@/types/domain";

export interface VendorService {
  listVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createNoticeApproval(id: string): Promise<Approval>;
}

export const vendorService: VendorService = {
  async listVendors() {
    return getOrEmpty<Vendor[]>("/vendors", []);
  },

  async getVendor(id) {
    try {
      const response = await api.get<Vendor | { data: Vendor }>(`/vendors/${id}`);
      return unwrap(response.data);
    } catch {
      return undefined;
    }
  },

  async createNoticeApproval(id) {
    const response = await api.post<Approval | { data: Approval }>(`/vendors/${id}/notice-approval`);
    return unwrap(response.data);
  },
};
