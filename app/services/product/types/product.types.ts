/**
 * Product API contracts — aligned with BE `toProductResponse`.
 * Reads nest `teacher`, `studyYear`, `academicYear`; flat FK ids are omitted on responses.
 */

export type NamedRef = {
  id: string;
  name: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

export type ProductType = "BOOK" | "CARD" | "BOOKLET";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "UPCOMING";

/** CS search availability (not DB product status). */
export type ProductAvailabilityStatus =
  | "AVAILABLE"
  | "UPCOMING"
  | "OUT_OF_STOCK";

/**
 * Stable response from:
 * GET /products, GET /products/:id,
 * POST /products, PATCH /products/:id
 *
 * Cost fields (`purchasePrice`, `profitPercentage`) are admin-only.
 */
export type ProductResponse = {
  id: string;
  name: string;
  type: ProductType | string;
  status: ProductStatus | string;
  sellingPrice: number | null;
  reservationAllowed: boolean;
  minStockQuantity: number | null;
  teacher: NamedRef | null;
  studyYear: NamedRef | null;
  academicYear: AcademicYearRef | null;
  purchasePrice?: number | null;
  profitPercentage?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Branch stock row on CS product search. */
export type ProductSearchBranch = {
  id: string;
  name: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  sellingPrice: number | null;
};

/**
 * GET /products/search item — ProductResponse plus per-branch availability.
 * `status` is availability; `productStatus` is the DB product status.
 */
export type ProductSearchResponse = Omit<ProductResponse, "status"> & {
  status: ProductAvailabilityStatus | string;
  productStatus: ProductStatus | string;
  branches: ProductSearchBranch[];
  totalAvailable: number;
};

/** GET /products query params. */
export type ProductQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  teacherId?: string;
  type?: string;
  studyYearId?: string;
  academicYearId?: string;
  reservationAllowed?: boolean;
};

/** GET /products/search query params. */
export type ProductSearchQuery = {
  page?: number;
  per_page?: number;
  product?: string;
  type?: string;
  teacherId?: string;
  branchId?: string;
  academicYearId?: string;
};

/** POST /products body. */
export type ProductPayload = {
  name: string;
  type: string;
  teacherId: string;
  studyYearId: string;
  academicYearId?: string;
  purchasePrice: number;
  sellingPrice: number;
  profitPercentage: number;
  reservationAllowed?: boolean;
  minStockQuantity?: number | null;
};

/** PATCH /products/:id body. */
export type ProductUpdatePayload = Partial<ProductPayload>;

/** List/table row after `normalizeProductListItem`. */
export type ProductListItem = ProductResponse & {
  teacherName: string;
  studyYearName: string;
  sellingPriceLabel: string;
  typeLabel: string;
  reservationLabel: string;
};
