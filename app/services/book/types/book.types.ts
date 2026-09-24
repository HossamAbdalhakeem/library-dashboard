/**
 * Book API contracts — book FE wraps products (type fixed to BOOK).
 * Aligned with BE `toProductResponse` + CS search enrichment.
 * Reads nest `teacher` / `studyYear` / `academicYear`; flat FKs omitted on responses.
 */

export type NamedRef = {
  id: string;
  name: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

/** Product DB status. */
export type BookProductStatus = "ACTIVE" | "INACTIVE" | "UPCOMING" | string;

/** CS search availability status (not product DB status). */
export type BookAvailabilityStatus =
  | "AVAILABLE"
  | "UPCOMING"
  | "OUT_OF_STOCK"
  | string;

/**
 * Stable product/book READ shape used as base for search responses.
 */
export type BookResponse = {
  id: string;
  name: string;
  type: "BOOK" | string;
  status: BookProductStatus;
  sellingPrice: number | null;
  reservationAllowed: boolean;
  minStockQuantity: number | null;
  teacher: NamedRef | null;
  studyYear: NamedRef | null;
  academicYear: AcademicYearRef | null;
  /** Admin-only on some responses. */
  purchasePrice?: number | null;
  /** Admin-only on some responses. */
  profitPercentage?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Per-branch availability row on CS product search. */
export type BookSearchBranch = {
  id: string;
  name: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  sellingPrice: number | null;
};

/**
 * GET /products/search row scoped to books (with per-branch availability).
 * `status` is availability; `productStatus` is the product DB status.
 */
export type BookSearchResponse = Omit<BookResponse, "status"> & {
  status: BookAvailabilityStatus;
  productStatus: BookProductStatus;
  branches: BookSearchBranch[];
  totalAvailable: number;
};

/** GET /products/search query params (book search). */
export type BookSearchQuery = {
  page?: number;
  per_page?: number;
  product?: string;
  teacherId?: string;
  branchId?: string;
  academicYearId?: string;
};

/** List/table row after `normalizeBookSearchItem`. */
export type BookSearchListItem = {
  id: string;
  name: string;
  type: string | null;
  teacher: NamedRef | null;
  studyYear: NamedRef | null;
  academicYear: AcademicYearRef | null;
  sellingPrice: number | null;
  sellingPriceLabel: string;
  status: BookAvailabilityStatus;
  statusLabel: string;
  reservationAllowed: boolean;
  branches: BookSearchBranch[];
  totalAvailable: number;
  teacherName: string;
  studyYearName: string;
  productCell: {
    name: string;
    price: string;
    teacherName: string | null;
    studyYearName: string | null;
  };
};

/** Selection payload from `buildBookSelection` (flat FK ids for form fields). */
export type BookSelection = {
  productId: string;
  productName: string;
  type: string | null;
  status: string;
  sellingPrice: number;
  reservationAllowed: boolean;
  teacherId: string | null;
  teacherName: string | null;
  studyYearId: string | null;
  studyYearName: string | null;
  branchId: string | null;
  branchName: string | null;
  availableQuantity: number;
  totalAvailable: number;
};
