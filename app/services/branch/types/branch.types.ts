/**
 * Branch API contracts — aligned with BE `toBranchResponse` /
 * `toInventorySummaryItem`.
 * Inventory items nest `product`; flat productId/productName are omitted.
 */

export type NamedRef = {
  id: string;
  name: string;
};

/** Entity status as returned by the API. */
export type BranchStatus = "ACTIVE" | "INACTIVE";

/** Nested inventory row from `toInventorySummaryItem`. */
export type BranchInventoryItem = {
  product: NamedRef;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
};

/** Present when GET /branches?inventory_summary=true. */
export type BranchInventorySummary = {
  productsCount: number;
  alertsCount: number;
  preview: BranchInventoryItem[];
  items: BranchInventoryItem[];
};

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
  inventorySummary?: BranchInventorySummary;
};

/** GET /branches query params. */
export type BranchQuery = {
  inventory_summary?: boolean;
  academicYearId?: string;
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

/** Flattened inventory row after `normalizeInventoryItem`. */
export type BranchInventoryListItem = {
  productId: string | null;
  productName: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
};

/** List/table row after `normalizeBranchListItem`. */
export type BranchListItem = {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: BranchStatus | string;
  statusLabel: string;
  productsCount: number;
  alertsCount: number;
  inventoryPreview: BranchInventoryListItem[];
  inventoryItems: BranchInventoryListItem[];
};
