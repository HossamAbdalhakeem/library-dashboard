/**
 * Branch report API contracts — `/reports/branch/*`.
 * Classic daily rows stay flat display strings (`mapSaleRow` etc.).
 * Student-ops / stock / timeline use nested refs from shared types.
 */

import type {
  ReportNamedRef,
  ReportOperationTimeline,
  ReportPaginated,
  ReportPagination,
  ReportPaymentMethod,
  ReportPaymentProof,
  ReportProductRef,
  ReportQuery,
  ReportStudentOperationsSection,
} from "../../shared/types/reports-shared.types";
import type { BranchReportSection } from "../../shared/daily-report.types";
import type { PaymentMethod } from "~/enums/paymentMethod";

export type BranchReportQuery = ReportQuery;

export type BranchReportSummary = {
  paymentsCollected: number;
  refundsTotal: number;
  paymentsTotal: number;
  paymentsByMethod: ReportPaymentMethod[];
  branchExpenses: number;
  sales?: number;
  reservations?: number;
  deliveredReservations?: number;
  cancelledReservations?: number;
  undeliveredReservations?: number;
  returns?: number;
  exchanges?: number;
  receivedQty?: number;
  stockOutQty?: number;
  stockMovements?: number;
};

/** GET /reports/branch/summary */
export type BranchDailySummaryResponse = {
  section: "summary";
  scope: "branch";
  branchId: string;
  from: string;
  to: string;
  summary: BranchReportSummary;
};

/** Classic sale row — flat display strings (+ optional nested payment proof). */
export type ReportSaleRow = {
  time: string;
  student: string;
  products: string;
  amount: number;
  method: PaymentMethod;
  by: string;
  payment?: ReportPaymentProof;
};

export type ReportReservationRow = {
  time: string;
  number: string;
  student: string;
  product: string;
  branch?: string;
  status: string;
  paid: number;
  by: string;
  method?: PaymentMethod;
  payment?: ReportPaymentProof;
};

export type ReportDeliveredRow = {
  time: string;
  number: string;
  student: string;
  product: string;
  branch?: string;
  by: string;
};

export type ReportCancelledRow = {
  time: string;
  number: string;
  student: string;
  product: string;
  branch?: string;
  paid: number;
  refund: number;
  by: string;
};

export type ReportReturnRow = {
  time: string;
  student: string;
  products: string;
  quantity: number;
  refund: number;
  by: string;
};

export type ReportExchangeRow = {
  time: string;
  student: string;
  fromProduct: string;
  toProduct: string;
  quantity: number;
  difference: number;
  by: string;
  branch?: string;
};

export type ReportMovementRow = {
  time: string;
  product: string;
  type: string;
  quantityChange: number;
  quantityLabel: string;
  by: string;
  note: string;
};

/** Classic `{ section, rows }` section wrapper (raw entity arrays may also be present). */
export type BranchClassicRowsSection<TRow> = {
  section: string;
  rows: TRow[];
};

export type BranchSalesSection = BranchClassicRowsSection<ReportSaleRow>;
export type BranchReservationsSection =
  BranchClassicRowsSection<ReportReservationRow>;
export type BranchDeliveredSection =
  BranchClassicRowsSection<ReportDeliveredRow>;
export type BranchCancelledSection =
  BranchClassicRowsSection<ReportCancelledRow>;
export type BranchReturnsSection = BranchClassicRowsSection<ReportReturnRow>;
export type BranchExchangesSection =
  BranchClassicRowsSection<ReportExchangeRow>;
export type BranchReceivedSection = BranchClassicRowsSection<ReportMovementRow>;
export type BranchStockOutSection = BranchClassicRowsSection<ReportMovementRow>;

/** Nested stock warehouse row (`listStockOperations`). */
export type BranchStockOperationRow = {
  id: string;
  createdAt: string;
  type: string;
  quantity: number;
  physicalQuantityChange: number;
  reservedQuantityChange: number;
  note: string | null;
  price: number;
  unitPrice: number;
  product: ReportProductRef | null;
  teacher: ReportNamedRef | null;
};

export type BranchStockOperationsSection = {
  section: string;
  scope: "stock-operations";
  data: BranchStockOperationRow[];
  pagination: ReportPagination;
};

export type BranchRefundKind =
  | "RETURN"
  | "EXCHANGE"
  | "RESERVATION_CANCEL"
  | "SALE_REFUND"
  | string;

export type BranchRefundRow = {
  id: string;
  createdAt: string;
  kind: BranchRefundKind;
  amount: number;
  method: PaymentMethod;
  payment: ReportPaymentProof;
  studentName: string;
  studentPhone: string;
  productName: string;
  originalCreatedAt: string | null;
  originalRef: string;
  saleId: string | null;
  reservationId: string | null;
  returnId: string | null;
  exchangeId: string | null;
  exchangeToName: string | null;
};

export type BranchRefundsSection = {
  section: string;
  data: BranchRefundRow[];
  totals: { amount: number };
  pagination: ReportPagination;
};

export type BranchStudentOperationsSection = ReportStudentOperationsSection;

export type BranchOperationTimeline = ReportOperationTimeline;

/** Union of payloads returned by `getSection`. */
export type BranchSectionResponse =
  | BranchSalesSection
  | BranchReservationsSection
  | BranchDeliveredSection
  | BranchCancelledSection
  | BranchReceivedSection
  | BranchStockOutSection
  | BranchStockOperationsSection
  | BranchStudentOperationsSection
  | BranchReturnsSection
  | BranchExchangesSection
  | BranchRefundsSection
  | ReportPaginated<unknown>
  | Record<string, unknown>;

export type { BranchReportSection };
