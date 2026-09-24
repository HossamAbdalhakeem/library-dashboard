/**
 * Reservation API contracts — aligned with BE `toReservationResponse`.
 * Reads nest student / branch / product / createdBy / payment;
 * flat FKs (studentId / branchId / productId / createdById / academicYearId)
 * are omitted on responses.
 */

import type { PaymentMethod } from "~/enums/paymentMethod";

export type NamedRef = {
  id: string;
  name: string;
};

export type StudentRef = {
  id?: string;
  name: string;
  phone?: string | null;
};

export type CreatedByRef = {
  id?: string;
  fullName: string;
  role: string;
};

export type ReservationProductTeacherRef = {
  id?: string;
  name: string;
};

/** Nested product on reservation reads (live unit/total under product). */
export type ReservationProductRef = {
  id?: string;
  name?: string | null;
  teacher: ReservationProductTeacherRef | null;
  unitPrice: number;
  totalAmount: number;
};

export type PaymentImageRef = {
  reference: string | null;
  url: string | null;
  hasProof: boolean;
};

/** Nested payment on reservation reads (summary + paid/remaining). */
export type ReservationPaymentRef = {
  id: string | null;
  method: PaymentMethod;
  methodLabel: string;
  image: PaymentImageRef;
  paidAmount: number;
  remainingAmount: number;
};

/** Entity status as returned by the API. */
export type ReservationStatus =
  | "PENDING"
  | "WAITING_FOR_STOCK"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

/**
 * Stable response from:
 * GET /reservations, GET /reservations/:id,
 * POST /reservations, POST /reservations/:id/cancel,
 * POST /reservations/:id/change-product
 * (and `reservation` on deliver).
 */
export type ReservationResponse = {
  id: string;
  reservationNumber: string;
  status: ReservationStatus | string;
  quantity: number;
  student: StudentRef | null;
  branch: NamedRef | { name: string } | null;
  createdBy: CreatedByRef | null;
  product: ReservationProductRef | null;
  payment: ReservationPaymentRef;
  createdAt?: string;
};

/** GET /reservations query params. */
export type ReservationQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  academicYearId?: string;
  branchId?: string;
};

/** POST /reservations body. */
export type CreateReservationPayload = {
  studentId: string;
  productId: string;
  quantity: number;
  deposit: number;
  method: PaymentMethod;
  branchId?: string;
  proofReference?: string;
};

/** POST /reservations/:id/deliver body. */
export type DeliverReservationPayload = {
  method?: PaymentMethod;
  proofReference?: string;
};

/** POST /reservations/:id/cancel body. */
export type CancelReservationPayload = {
  refundMethod?: PaymentMethod;
  proofReference?: string;
};

/** POST /reservations/:id/change-product body. */
export type ChangeProductPayload = {
  newProductId: string;
  refundMethod?: PaymentMethod;
  proofReference?: string;
};

/** Nested sale on POST /reservations/:id/deliver — aligned with BE `toSaleResponse`. */
export type DeliverSaleProductRef = {
  id: string;
  name: string;
  type: string | unknown;
  status: string | unknown;
  sellingPrice: number | null;
  reservationAllowed: boolean;
  minStockQuantity: number | null;
  teacher: NamedRef | null;
  studyYear: NamedRef | null;
  academicYear: (NamedRef & { status?: string }) | null;
  purchasePrice?: number | null;
  profitPercentage?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DeliverSaleItemRef = {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  returnedQuantity: number;
  product: DeliverSaleProductRef | null;
  unitCost?: number;
};

export type DeliverSalePaymentRef = {
  id: string | null;
  method: PaymentMethod;
  methodLabel: string;
  image: PaymentImageRef;
  amount?: number;
  createdAt?: string;
};

export type DeliverSaleResponse = {
  id: string;
  status?: string | unknown;
  totalAmount: number;
  student: (NamedRef & { phone?: string | null }) | null;
  branch: NamedRef | null;
  academicYear: (NamedRef & { status?: string }) | null;
  createdBy: {
    id: string;
    fullName: string | null;
    email: string | null;
  } | null;
  reservation: { id: string } | null;
  items: DeliverSaleItemRef[];
  payment: DeliverSalePaymentRef | null;
  payments: DeliverSalePaymentRef[];
  returns: Array<{
    id: string;
    totalRefundAmount: number;
    createdAt?: string;
  }>;
  exchanges: Array<{
    id: string;
    quantity?: number;
    differenceAmount: number;
    createdAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

/** POST /reservations/:id/deliver → `{ reservation, sale }`. */
export type DeliverReservationResponse = {
  reservation: ReservationResponse;
  sale: DeliverSaleResponse;
};

/** GET /reservations/:id/timeline — aligned with BE operation timeline. */
export type ReservationTimelineEvent = {
  id: string;
  type: string;
  date: string;
  actor: { id: string; name: string } | null;
  data: Record<string, unknown>;
};

export type ReservationTimelineResponse = {
  operation: {
    id: string;
    type: "RESERVATION" | string;
    status: string;
    operationNumber: string | null;
    student: (NamedRef & { phone?: string | null }) | null;
    product: Record<string, unknown> | null;
    quantity: number;
    financial: {
      total: number;
      paid: number;
      remaining: number;
    };
  };
  timeline: ReservationTimelineEvent[];
};

/** List/table row after `normalizeReservation`. */
export type ReservationListItem = ReservationResponse & {
  statusLabel: string;
  productName: string;
  studentName: string;
  branchName: string;
  teacherName: string;
  paidAmount: number;
  remainingAmount: number;
  hasRemaining: boolean;
};
