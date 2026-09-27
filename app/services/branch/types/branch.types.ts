/**
 * Branch API contracts — aligned with BE `toBranchResponse`.
 */

export type NamedRef = {
  id: string;
  name: string;
};

/** Entity status as returned by the API. */
export type BranchStatus = "ACTIVE" | "INACTIVE";

/**
 * Stable response from:
 * GET /branches, GET /branches/:id,
 * POST /branches, PATCH /branches/:id, PATCH /branches/:id/status
 */
export type BranchResponse = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: BranchStatus | string;
  createdAt?: string;
  updatedAt?: string;
};

/** POST /branches body. */
export type BranchPayload = {
  name: string;
  address?: string;
  phone?: string;
};

/** PATCH /branches/:id body. */
export type BranchUpdatePayload = {
  name?: string;
  address?: string;
  phone?: string;
};

/** PATCH /branches/:id/status body. */
export type BranchStatusPayload = {
  status: BranchStatus;
};

/** List/table row after `normalizeBranchListItem`. */
export type BranchListItem = {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: BranchStatus | string;
  statusLabel: string;
};
