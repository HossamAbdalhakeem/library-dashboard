import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  BranchQuery,
  BranchPayload,
  BranchUpdatePayload,
  BranchStatusPayload,
  BranchResponse,
} from "../types/branch.types";

export const branchApi = {
  /** GET /branches → BranchResponse[] */
  async getBranches(params: BranchQuery = {}): Promise<BranchResponse[]> {
    return asList<BranchResponse>(
      await apiFetch("/branches", { method: "GET", params }),
    );
  },

  /** POST /branches → BranchResponse | null */
  async createBranch(payload: BranchPayload): Promise<BranchResponse | null> {
    return firstRow<BranchResponse>(
      await apiFetch("/branches", { method: "POST", body: payload }),
    );
  },

  /** PATCH /branches/:id → BranchResponse | null */
  async updateBranch(
    id: string,
    payload: BranchUpdatePayload,
  ): Promise<BranchResponse | null> {
    return firstRow<BranchResponse>(
      await apiFetch(`/branches/${id}`, { method: "PATCH", body: payload }),
    );
  },

  /** PATCH /branches/:id/status → BranchResponse | null */
  async updateBranchStatus(
    id: string,
    payload: BranchStatusPayload,
  ): Promise<BranchResponse | null> {
    return firstRow<BranchResponse>(
      await apiFetch(`/branches/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `branchApi` */
export const branchService = branchApi;
