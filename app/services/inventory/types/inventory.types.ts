/**
 * Inventory API contracts — aligned with BE `toInventoryResponse`,
 * `toInventorySummaryResponse`, and `toStockMovementResponse`.
 *
 * - `productId` kept as routing key for `/inventory/:branchId/:productId`
 * - nested `product` via product response shape
 * - flat `branchId` omitted when `branch` is nested
 */

export type NamedRef = {
  id: string;
  name: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

/** Nested product on inventory / movement reads. */
export type InventoryProductResponse = {
  id: string;
  name: string;
  type: string | unknown;
  status: string | unknown;
  sellingPrice: number | null | unknown;
  reservationAllowed: boolean;
  minStockQuantity: number | null;
  teacher: NamedRef | null;
  studyYear: NamedRef | null;
  academicYear: AcademicYearRef | null;
  purchasePrice?: number | null | unknown;
  profitPercentage?: number | null | unknown;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Stable inventory row from:
 * GET /inventory, GET /inventory/:branchId,
 * GET /inventory/:branchId/:productId
 */
export type InventoryResponse = {
  productId: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  product: InventoryProductResponse;
  branch?: NamedRef | null;
  lowStockThreshold?: number;
};

/** Preview row inside inventory_summary. */
export type InventorySummaryPreviewItem = {
  product: NamedRef;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
};

/**
 * Summary from GET /inventory?inventory_summary=true (per branch)
 * or GET /inventory/:branchId?inventory_summary=true.
 */
export type InventorySummaryResponse = {
  branch: NamedRef;
  productsCount: number;
  preview: InventorySummaryPreviewItem[];
};

/**
 * Stock movement from GET /inventory/:branchId/:productId/movements.
 * Nested product + branch; flat FKs omitted.
 */
export type StockMovementResponse = {
  id: string;
  movementType: string | unknown;
  physicalQuantityChange: number;
  reservedQuantityChange: number;
  note: string | null;
  referenceId: string | null;
  createdAt: string | unknown;
  product: InventoryProductResponse | null;
  branch: NamedRef | null;
  createdBy: {
    id: string;
    fullName: string | null;
    email: string | null;
  } | null;
};

/** POST add/remove stock — BE returns `{ id }` only. */
export type StockMutationResponse = {
  id: string;
};

/** FE availability helper return (from getStockItem). */
export type InventoryAvailability = {
  availableQuantity: number;
  physicalQuantity: number;
  reservedQuantity: number;
};

/** GET /inventory query params. */
export type InventoryQuery = {
  search?: string;
  teacherId?: string;
  studyYearId?: string;
  academicYearId?: string;
  type?: string;
  availableOnly?: boolean;
  forReservation?: boolean;
  inventory_summary?: boolean;
};

/**
 * Client payload for add/remove stock.
 * `branchId` / `productId` are URL path params; body is quantity + note.
 */
export type StockQuantityPayload = {
  branchId: string;
  productId: string;
  quantity: number;
  note?: string;
};

/** List/table row after `normalizeInventoryListItem`. */
export type InventoryListItem = {
  productId: string | null;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number | null;
  product: InventoryProductResponse | null;
  branch: NamedRef | null;
  productName: string;
  teacherName: string;
  studyYearName: string;
  branchName: string;
};
