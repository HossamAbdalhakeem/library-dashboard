/**
 * Return API contracts — aligned with BE `toReturnResponse`.
 * Reads nest sale / saleItem / product / createdBy / refunds;
 * flat FK columns (saleId / createdById / …) are omitted on responses.
 */

import type { PaymentMethod } from "~/enums/paymentMethod";

export type NamedRef = {
  id: string;
  name: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

export type StudentRef = NamedRef & {
  phone?: string | null;
};

export type CreatedByRef = {
  id: string;
  fullName?: string | null;
  email?: string | null;
};

/** Nested product on return lines — lighter than full product entity. */
export type ReturnProductRef = {
  id: string;
  name: string;
  type?: string | unknown;
  status?: string | unknown;
  sellingPrice?: number;
  /** Admin-only */
  purchasePrice?: number;
  /** Admin-only */
  profitPercentage?: number;
};

export type ReturnSaleItemRef = {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  returnedQuantity: number;
  /** Admin-only */
  unitCost?: number;
  product: ReturnProductRef | null;
};

export type ReturnItemResponse = {
  id: string;
  quantity: number;
  refundAmount: number;
  saleItem: ReturnSaleItemRef | null;
};

export type ReturnRefundRef = {
  id: string;
  amount: number;
  method?: PaymentMethod;
  proofReference?: string | null;
  createdAt?: string;
};

/**
 * Stable response from:
 * GET /returns, GET /returns/:id, POST /returns
 */
export type ReturnResponse = {
  id: string;
  totalRefundAmount: number;
  sale: {
    id: string;
    totalAmount: number;
    status?: string | unknown;
    createdAt?: string;
    student: StudentRef | null;
    branch: NamedRef | null;
    academicYear: AcademicYearRef | null;
    items: ReturnSaleItemRef[];
  } | null;
  createdBy: CreatedByRef | null;
  items: ReturnItemResponse[];
  refunds: ReturnRefundRef[];
  createdAt?: string;
};

/** GET /returns query params. */
export type ReturnQuery = {
  academicYearId?: string | null;
};

/** One line in POST /returns body. */
export type ReturnItemPayload = {
  saleItemId: string;
  quantity: number;
};

/** POST /returns body — flat FKs (CreateReturnDto). */
export type ReturnPayload = {
  saleId: string;
  items: ReturnItemPayload[];
  method: PaymentMethod;
  proofReference?: string;
};

/** List/table row after `normalizeReturnListItem`. */
export type ReturnListItem = ReturnResponse & {
  studentName: string;
  branchName: string;
  academicYearName: string;
  products: string;
  quantity: number;
  totalRefundAmountLabel: string;
  createdByName: string;
  refundMethod: string | null;
  refundMethodLabel: string;
};
