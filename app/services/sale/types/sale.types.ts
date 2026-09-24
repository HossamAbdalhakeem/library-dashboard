/**
 * Sale API contracts — aligned with BE `toSaleResponse`.
 * Reads nest student / branch / academicYear / product / payment;
 * flat FK columns are omitted on responses.
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

/** Nested product on sale lines — matches `toProductResponse`. */
export type SaleProductRef = {
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

/** Nested payment — matches payment-proof helper / `toSaleResponse`. */
export type SalePaymentRef = {
  id: string | null;
  method: PaymentMethod;
  methodLabel: string;
  image: PaymentImageRef;
  amount?: number;
  createdAt?: string;
};

export type SaleItemResponse = {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  returnedQuantity: number;
  /** Admin-only */
  unitCost?: number;
  product: SaleProductRef | null;
};

export type SaleReturnBrief = {
  id: string;
  totalRefundAmount: number;
  createdAt?: string;
};

export type SaleExchangeBrief = {
  id: string;
  quantity?: number;
  differenceAmount: number;
  createdAt?: string;
};

/**
 * Stable response from POST /sales
 */
export type SaleResponse = {
  id: string;
  status?: string | unknown;
  totalAmount: number;
  student: StudentRef | null;
  branch: NamedRef | null;
  academicYear: AcademicYearRef | null;
  createdBy: CreatedByRef | null;
  reservation: { id: string } | null;
  items: SaleItemResponse[];
  payment: SalePaymentRef | null;
  payments: SalePaymentRef[];
  returns: SaleReturnBrief[];
  exchanges: SaleExchangeBrief[];
  createdAt?: string;
  updatedAt?: string;
};

/** POST /sales body — flat FKs (CreateSaleDto). */
export type SalePayload = {
  studentId: string;
  productId: string;
  quantity: number;
  method: PaymentMethod;
  proofReference?: string;
};

/** Timeline event types from BE operation timeline. */
export type SaleTimelineEventType =
  | "CREATED"
  | "PAYMENT"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUND"
  | "EXCHANGE"
  | "RETURN"
  | "COMPLETED"
  | string;

export type SaleTimelineEvent = {
  id: string;
  type: SaleTimelineEventType;
  date: string;
  actor: { id: string; name: string } | null;
  data: Record<string, unknown>;
};

/** GET /sales/:id/timeline */
export type SaleTimelineResponse = {
  operation: {
    id: string;
    type: "SALE" | string;
    status: string;
    operationNumber: string | null;
    originType: "SALE" | "RESERVATION" | string;
    student: StudentRef | null;
    product: (NamedRef & { price?: number | null }) | null;
    quantity: number;
    financial: {
      total: number;
      paid: number;
      remaining: number;
    };
  };
  timeline: SaleTimelineEvent[];
};
