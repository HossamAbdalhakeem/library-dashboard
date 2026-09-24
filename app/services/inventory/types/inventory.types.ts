/**
 * Inventory API contracts — aligned with BE `toInventoryResponse`.
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

/** Nested product on inventory reads. */
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
 * GET /inventory/:branchId
 */
export type InventoryResponse = {
  productId: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  product: InventoryProductResponse;
  branch?: NamedRef | null;
  lowStockThreshold?: number;
  soldQuantity?: number;
  isLowStock?: boolean;
};

/** POST add/remove stock — BE returns `{ id }` only. */
export type StockMutationResponse = {
  id: string;
};

/** GET /inventory/:branchId query params. */
export type InventoryQuery = {
  search?: string;
  teacherId?: string;
  studyYearId?: string;
  academicYearId?: string;
  type?: string;
  availableOnly?: boolean;
  forReservation?: boolean;
  include_sold?: boolean;
  page?: number;
  per_page?: number;
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
