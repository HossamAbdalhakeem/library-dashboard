/**
 * Customer-service report API contracts — `/reports/customer-service/*`.
 * Classic reservation rows stay flat; student-ops / timeline match branch nested shapes.
 */

import type {
  ReportOperationTimeline,
  ReportPaymentMethod,
  ReportPaymentProof,
  ReportQuery,
  ReportStudentOperationsSection,
} from "../../shared/types/reports-shared.types";
import type { CustomerServiceReportSection } from "../../shared/daily-report.types";
import type { PaymentMethod } from "~/enums/paymentMethod";

export type CustomerServiceReportQuery = ReportQuery;

export type CustomerServiceReportSummary = {
  paymentsCollected: number;
  refundsTotal: number;
  paymentsTotal: number;
  paymentsByMethod: ReportPaymentMethod[];
  reservations?: number;
  readyReservations?: number;
  deliveredReservations?: number;
  cancelledReservations?: number;
  undeliveredReservations?: number;
};

/** GET /reports/customer-service/summary */
export type CustomerServiceDailySummaryResponse = {
  section: "summary";
  scope: "customer_service";
  from: string;
  to: string;
  summary: CustomerServiceReportSummary;
};

/** Flat reservation display row (includes branch for CS). */
export type CustomerServiceReservationRow = {
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

export type CustomerServiceDeliveredRow = {
  time: string;
  number: string;
  student: string;
  product: string;
  branch?: string;
  by: string;
};

export type CustomerServiceCancelledRow = {
  time: string;
  number: string;
  student: string;
  product: string;
  branch?: string;
  paid: number;
  refund: number;
  by: string;
};

export type CustomerServiceClassicRowsSection<TRow> = {
  section: string;
  rows: TRow[];
};

export type CustomerServiceReservationsSection =
  CustomerServiceClassicRowsSection<CustomerServiceReservationRow>;
export type CustomerServiceDeliveredSection =
  CustomerServiceClassicRowsSection<CustomerServiceDeliveredRow>;
export type CustomerServiceCancelledSection =
  CustomerServiceClassicRowsSection<CustomerServiceCancelledRow>;

export type CustomerServiceStudentOperationsSection =
  ReportStudentOperationsSection;

export type CustomerServiceOperationTimeline = ReportOperationTimeline;

export type CustomerServiceSectionResponse =
  | CustomerServiceReservationsSection
  | CustomerServiceDeliveredSection
  | CustomerServiceCancelledSection
  | CustomerServiceStudentOperationsSection
  | Record<string, unknown>;

export type { CustomerServiceReportSection };
