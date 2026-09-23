/**
 * Shared report API contracts — query params, pagination, and nested refs
 * reused by branch + customer-service (and admin query).
 * Dates on the wire are ISO strings (JSON).
 */

import type { PaymentMethod } from "~/enums/paymentMethod";
import type { OperationActivity } from "~/enums/operationActivity";
import type { OperationKind } from "~/enums/operationKind";
import type { OperationStatus } from "~/enums/operationStatus";

/** Matching Nest `ReportQueryDto` (camelCase). */
export type ReportQuery = {
  from?: string;
  to?: string;
  period?: "today" | "day" | "week" | "month" | "year" | "custom" | string;
  branchId?: string;
  productId?: string;
  academicYearId?: string;
  page?: number;
  per_page?: number;
  movementType?: string;
};

/** BE `paginationObject` shape for report list sections. */
export type ReportPagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type ReportPaginated<T> = {
  data: T[];
  pagination: ReportPagination;
};

export type ReportNamedRef = {
  id: string;
  name: string;
};

export type ReportPaymentMethod = {
  method: PaymentMethod;
  amount: number;
};

/** Nested payment summary (proof image) on classic daily rows / timeline. */
export type ReportPaymentProof = {
  id: string | null;
  method: PaymentMethod;
  methodLabel: string;
  image: {
    reference: string | null;
    url: string | null;
    hasProof: boolean;
  };
};

/** Nested product from student-ops / stock / timeline (`mapProduct`). */
export type ReportProductRef = {
  id: string;
  name: string;
  type: string | null;
  sellingPrice: number | null;
  price: number | null;
  studyYear: ReportNamedRef | null;
  teacher: ReportNamedRef | null;
};

export type ReportStudentRef = {
  id: string;
  name: string;
};

export type ReportCreatedByRef = {
  id: string;
  fullName: string;
};

export type ReportBranchRef = ReportNamedRef;

/** Report-only lifecycle status on student-ops / timeline. */
export type ReportOperationStatus = OperationStatus | string;

/** @deprecated Prefer `OperationKind` from `~/enums/operationKind`. */
export type ReportOperationKind = OperationKind;

/** @deprecated Prefer `OperationActivity` from `~/enums/operationActivity`. */
export type ReportOperationActivity = OperationActivity;

/**
 * Student-operations list row (branch + CS).
 * Nested student / product / createdBy / branch — no flat FKs.
 * Use `activity` for the day badge (تسليم حجز vs حجز).
 */
export type ReportStudentOperationRow = {
  id: string;
  type: OperationKind;
  activity: OperationActivity;
  date: string;
  createdAt: string;
  student: ReportStudentRef | null;
  product: ReportProductRef | null;
  quantity: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  /** Money collected for this day's activity (e.g. remaining at delivery). */
  activityPaidAmount: number;
  status: ReportOperationStatus;
  operationNumber: string | null;
  createdBy: ReportCreatedByRef | null;
  branch: ReportBranchRef | null;
};

export type ReportStudentOperationsSection = {
  section: string;
  scope: "student-operations";
  data: ReportStudentOperationRow[];
  pagination: ReportPagination;
};

export type ReportTimelineEventType =
  | "CREATED"
  | "PAYMENT"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUND"
  | "EXCHANGE"
  | "RETURN"
  | "COMPLETED"
  | string;

export type ReportTimelineActor = {
  id: string;
  name: string;
} | null;

export type ReportTimelineEvent = {
  id: string;
  type: ReportTimelineEventType;
  date: string;
  actor: ReportTimelineActor;
  data: Record<string, unknown>;
};

export type ReportOperationTimeline = {
  operation: {
    id: string;
    type: OperationKind;
    status: ReportOperationStatus;
    operationNumber: string | null;
    originType?: OperationKind;
    student: (ReportStudentRef & { phone?: string | null }) | null;
    product: ReportProductRef | null;
    quantity: number;
    financial: {
      total: number;
      paid: number;
      remaining: number;
    };
  };
  timeline: ReportTimelineEvent[];
};
