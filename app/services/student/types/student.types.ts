/**
 * Student API contracts — aligned with BE `toStudentResponse` /
 * `toStudentTransactionRow`.
 * Reads nest `studyYear` / `academicYear`; flat FK ids are omitted on responses.
 */

import type { PaymentMethod } from "~/enums/paymentMethod";

export type NamedRef = {
  id: string;
  name: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

export type StudentStatus = "ACTIVE" | "INACTIVE";

/**
 * Stable response from:
 * GET /students, GET /students/:id,
 * POST /students, PATCH /students/:id
 */
export type StudentResponse = {
  id: string;
  name: string;
  phone: string | null;
  status: StudentStatus | string;
  studyYear: NamedRef | null;
  academicYear: AcademicYearRef | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type StudentTransactionProduct = {
  id: string | null;
  name: string;
  teacher: NamedRef | null;
};

export type StudentTransactionPaymentImage = {
  reference: string | null;
  url: string | null;
  hasProof: boolean;
};

export type StudentTransactionPayment = {
  id: string | null;
  method: PaymentMethod;
  methodLabel: string;
  image: StudentTransactionPaymentImage;
};

/** Row from GET /students/:id/transactions (via `toStudentTransactionRow`). */
export type StudentTransactionResponse = {
  id: string;
  referenceId: string;
  type: "SALE" | "RESERVATION" | string;
  date: string;
  quantity: number;
  amount: number;
  status: string;
  product: StudentTransactionProduct | null;
  branch: NamedRef | null;
  payment: StudentTransactionPayment;
};

/** GET /students query params. */
export type StudentQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  academicYearId?: string;
  /** Admin students table only — include soft-deleted / INACTIVE students. */
  includeInactive?: boolean;
};

/** GET /students/:id/transactions query params. */
export type StudentTransactionsQuery = {
  page?: number;
  per_page?: number;
  from?: string;
  to?: string;
  teacherId?: string;
  productId?: string;
  academicYearId?: string;
};

/** GET /students/export query params. */
export type StudentExportQuery = {
  studyYearId?: string;
  studentId?: string;
  teacherId?: string;
  from?: string;
  to?: string;
  academicYearId?: string;
};

/** POST /students body. */
export type StudentPayload = {
  name: string;
  phone?: string;
  studyYearId: string;
  academicYearId?: string;
};

/** PATCH /students/:id body. */
export type StudentUpdatePayload = {
  name?: string;
  phone?: string;
  studyYearId?: string;
};

/** DELETE /students/:id response. */
export type StudentDeleteResponse = {
  id: string;
};

/** List/table row after `normalizeStudentListItem`. */
export type StudentListItem = StudentResponse & {
  studyYearName: string;
  statusLabel: string;
};
