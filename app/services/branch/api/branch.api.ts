import { apiFetch, asData, firstRow, asList } from "~/utils/apiFetch";
import type {
  BranchPayload,
  BranchUpdatePayload,
  BranchStatusPayload,
  BranchResponse,
} from "../types/branch.types";

export const branchApi = {
  /** GET /admin-api/branches → BranchResponse[] */
  async getBranches(
    params: Record<string, string | number | boolean | undefined> = {},
  ): Promise<BranchResponse[]> {
    return asList<BranchResponse>(
      await apiFetch("/admin-api/branches", { method: "GET", params }),
    );
  },

  /** POST /admin-api/branches/maps-link → latitude and longitude from a Google Maps URL */
  async resolveMapsLink(
    url: string,
  ): Promise<{ latitude: number; longitude: number }> {
    return asData<{ latitude: number; longitude: number }>(
      await apiFetch("/admin-api/branches/maps-link", { method: "POST", body: { url } }),
    );
  },

  /** POST /admin-api/branches → BranchResponse | null */
  async createBranch(payload: BranchPayload): Promise<BranchResponse | null> {
    return firstRow<BranchResponse>(
      await apiFetch("/admin-api/branches", { method: "POST", body: payload }),
    );
  },

  /** PATCH /admin-api/branches/:id → BranchResponse | null */
  async updateBranch(
    id: string,
    payload: BranchUpdatePayload,
  ): Promise<BranchResponse | null> {
    return firstRow<BranchResponse>(
      await apiFetch(`/admin-api/branches/${id}`, { method: "PATCH", body: payload }),
    );
  },

  /** PATCH /admin-api/branches/:id/status → BranchResponse | null */
  async updateBranchStatus(
    id: string,
    payload: BranchStatusPayload,
  ): Promise<BranchResponse | null> {
    return firstRow<BranchResponse>(
      await apiFetch(`/admin-api/branches/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `branchApi` */
export const branchService = branchApi;
