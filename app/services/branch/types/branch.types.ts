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
export type BranchLocation = {
  latitude: number;
  longitude: number;
};

export type BranchResponse = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: BranchStatus | string;
  location: BranchLocation | null;
  attendanceRadiusMeters: number;
  createdAt?: string;
  updatedAt?: string;
};

/** POST /branches body. */
export type BranchPayload = {
  name: string;
  address?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  attendanceRadiusMeters?: number;
};

/** PATCH /branches/:id body. */
export type BranchUpdatePayload = {
  name?: string;
  address?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  attendanceRadiusMeters?: number;
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
  locationLabel: string;
  radiusLabel: string;
  latitude: number | null;
  longitude: number | null;
  attendanceRadiusMeters: number;
};
