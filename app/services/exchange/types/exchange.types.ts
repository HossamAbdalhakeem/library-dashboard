/**
 * Exchange API contracts — aligned with BE
 * `toExchangeResponse`, `toExchangePreviewResponse`, `toEligibleSaleResponse`.
 * Reads nest sale / saleItem / newProduct / student / branch; flat FKs omitted.
 */

import type { PaymentMethod } from "~/enums/paymentMethod";

export type NamedRef = {
  id: string;
  name: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

export type TeacherBrief = {
  id?: string;
  name: string;
};

export type StudentBrief = {
  id?: string;
  name: string;
  phone?: string | null;
};

export type CreatedByRef = {
  id: string;
  fullName?: string | null;
  email?: string | null;
};

/** Nested product — matches `toProductResponse` on exchange entity reads. */
export type ExchangeProductRef = {
  id: string;
  name: string;
  type?: string | unknown;
  status?: string | unknown;
  sellingPrice?: number | null;
  /** Admin-only */
  purchasePrice?: number | null;
  /** Admin-only */
  profitPercentage?: number | null;
  reservationAllowed?: boolean;
  minStockQuantity?: number | null;
  teacher?: NamedRef | null;
  studyYear?: NamedRef | null;
  academicYear?: AcademicYearRef | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentImageRef = {
  reference: string | null;
  url: string | null;
  hasProof: boolean;
};

export type ExchangePaymentRef = {
  id: string | null;
  method: PaymentMethod;
  methodLabel: string;
  image: PaymentImageRef;
};

export type ExchangeRefundRef = {
  id: string;
  amount: number;
  method?: PaymentMethod;
  proofReference?: string | null;
  createdAt?: string;
};

export type ExchangeDiffKind = "more" | "less" | "same";

/**
 * Stable response from:
 * GET /exchanges, GET /exchanges/:id, POST /exchanges
 */
export type ExchangeResponse = {
  id: string;
  quantity: number;
  differenceAmount: number;
  sale: {
    id: string;
    status?: string | unknown;
    totalAmount?: number;
    createdAt?: string;
    student: StudentBrief | null;
    branch: NamedRef | null;
  } | null;
  saleItem: {
    id: string;
    quantity?: number;
    returnedQuantity?: number;
    unitPrice?: number;
    total?: number;
    product: ExchangeProductRef | null;
  } | null;
  newProduct: ExchangeProductRef | null;
  createdBy: CreatedByRef | null;
  refunds: ExchangeRefundRef[];
  createdAt?: string;
};

/** POST /exchanges/preview — matches `toExchangePreviewResponse`. */
export type ExchangePreviewResponse = {
  kind: ExchangeDiffKind;
  quantity: number;
  oldUnitPrice: number;
  newUnitPrice: number;
  oldTotal: number;
  newTotal: number;
  difference: number;
  absoluteDifference: number;
  requiresPayment: boolean;
  requiresRefund: boolean;
  remainingQuantity: number;
  maxQuantity: number;
  newProduct: {
    id: string;
    name: string;
    teacher: TeacherBrief | null;
    unitPrice: number;
    availableQuantity: number;
    isAvailable: boolean;
    availability: "AVAILABLE" | "UNAVAILABLE";
  };
};

export type EligibleSaleQuantity = {
  sold: number;
  returned: number;
  remaining: number;
};

/** Line product on eligible-sale rows (service-built, not full product entity). */
export type EligibleSaleProduct = {
  id: string;
  name: string;
  teacher: TeacherBrief | null;
  unitPrice: number;
  amount: number;
  refundAmount: number;
};

export type EligibleSaleItemExchange = {
  quantity: number;
  newProduct: {
    id: string;
    name: string;
    teacher: TeacherBrief | null;
  };
  replacementSaleItemId: string | null;
};

export type EligibleSaleItem = {
  saleItemId: string;
  originalSaleItemId: string;
  product: EligibleSaleProduct;
  quantity: EligibleSaleQuantity;
  lineStatus: string;
  canModify: boolean;
  exchange: EligibleSaleItemExchange | null;
};

export type EligibleSaleQuantitySummary = {
  label: string;
  totalSold: number;
  kind: "exchange" | "multi" | "simple";
};

/**
 * GET /exchanges/eligible-sales row — matches `toEligibleSaleResponse`.
 */
export type EligibleSaleResponse = {
  id: string;
  saleNumber: string;
  createdAt: string;
  status: string;
  canModify: boolean;
  totalAmount: number;
  paidAmount: number;
  quantitySummary: EligibleSaleQuantitySummary;
  student: StudentBrief;
  branch: NamedRef | null;
  payment: ExchangePaymentRef | null;
  items: EligibleSaleItem[];
};

/** List/table row after `normalizeEligibleSale`. */
export type EligibleSaleListItem = Omit<
  EligibleSaleResponse,
  "student" | "branch" | "payment" | "items" | "quantitySummary"
> & {
  type: string;
  typeLabel: string;
  statusLabel: string;
  totalAmountLabel: string;
  paidAmountLabel: string;
  createdAtLabel: string;
  quantitySummary: EligibleSaleQuantitySummary & {
    totalRemaining: number;
  };
  student: StudentBrief;
  branch: NamedRef | { name: string };
  payment: ExchangePaymentRef;
  items: EligibleSaleItem[];
  studentName: string;
  phone: string;
  branchName: string;
};

/** Flat dialog payload from `toExchangeFlowSale`. */
export type ExchangeFlowSale = {
  id: string;
  saleId: string;
  saleItemId: string;
  branchId: string | null;
  saleNumber: string;
  createdAt: string;
  status: string;
  saleStatus: string;
  lineStatus: string;
  canModify: boolean;
  quantity: EligibleSaleQuantity;
  remainingQuantity: number;
  student: StudentBrief;
  branch: NamedRef | { name: string } | null;
  product: EligibleSaleProduct;
  productId: string;
  payment: ExchangePaymentRef | null;
};

/** GET /exchanges query params. */
export type ExchangeQuery = {
  academicYearId?: string;
};

/** GET /exchanges/eligible-sales query params. */
export type EligibleSalesQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  academicYearId?: string;
  branchId?: string;
};

/** POST /exchanges/preview body. */
export type ExchangePreviewPayload = {
  saleId: string;
  saleItemId: string;
  newProductId: string;
  quantity: number;
};

/** POST /exchanges body — flat FKs (CreateExchangeDto). */
export type ExchangeCreatePayload = {
  saleId: string;
  saleItemId: string;
  newProductId: string;
  quantity: number;
  paymentMethod?: PaymentMethod;
  refundMethod?: PaymentMethod;
  proofReference?: string;
};
