/**
 * Admin report API contracts — modular `/reports/admin/*` + home `/reports/general/*`.
 * Aligned with BE AdminDashboardReportsService + admin/general/*.
 */

import type {
  ReportNamedRef,
  ReportPaymentMethod,
  ReportQuery,
} from "../../shared/types/reports-shared.types";

/** Admin modular + general query (same Nest ReportQueryDto fields). */
export type AdminReportQuery = ReportQuery;

export type AdminReportFilters = {
  branchId?: string;
  productId?: string;
  teacherId?: string;
  studyYearId?: string;
  academicYearId?: string;
  /** ISO timestamp: inventory levels reconstructed as of this moment (`to` end). */
  asOf?: string;
};

type AdminSectionBase = {
  section: string;
  scope: "admin";
  from?: string;
  to?: string;
  filters?: AdminReportFilters;
};

/** GET /reports/admin/summary */
export type AdminSummaryResponse = AdminSectionBase & {
  section: "summary";
  totalSales: number;
  salesCount: number;
  totalPayments: number;
  totalReservations: number;
  reservationPayments: number;
  reservationDeposits: number;
  outstandingAmount: number;
  inventoryTotal: number;
  grossProfit: number;
  netProfit: number;
};

/** GET /reports/admin/revenue */
export type AdminRevenueResponse = AdminSectionBase & {
  section: "revenue" | "sales";
  grossSales: number;
  returns: number;
  netSales: number;
};

export type AdminSalesTrendPoint = {
  date: string;
  label: string;
  sales: number;
};

/** GET /reports/admin/sales-trend */
export type AdminSalesTrendResponse = AdminSectionBase & {
  section: "sales-trend";
  granularity: "hourly" | "daily" | "monthly" | string;
  data: AdminSalesTrendPoint[];
};

/** GET /reports/admin/profit-loss */
export type AdminProfitLossResponse = AdminSectionBase & {
  section: "profit-loss";
  revenue: number;
  cogs: number;
  grossProfit: number;
  salesRelatedExpenses: number;
  generalExpenses: number;
  totalExpenses: number;
  netProfit: number;
  note: string;
};

export type AdminPaymentMethodItem = ReportPaymentMethod & {
  percent?: number;
};

/** GET /reports/admin/payment-methods */
export type AdminPaymentMethodsResponse = AdminSectionBase & {
  section: "payment-methods";
  payments: AdminPaymentMethodItem[];
  total: number;
  paymentsByMethod: ReportPaymentMethod[];
  paymentsCollected: number;
  refundsTotal: number;
  paymentsTotal: number;
};

export type AdminBranchPerformanceRow = {
  branchId: string;
  branchName: string;
  sales: number;
  salesCount: number;
  reservations: number;
  returns: number;
  expenses: number;
  netSales: number;
};

/** GET /reports/admin/branches */
export type AdminBranchesResponse = AdminSectionBase & {
  section: "branches";
  branches: AdminBranchPerformanceRow[];
};

/** GET /reports/admin/returns-exchanges */
export type AdminReturnsExchangesResponse = AdminSectionBase & {
  section: "returns-exchanges";
  returnsCount: number;
  exchangesCount: number;
  refundedAmount: number;
};

export type AdminReservationProductRow = {
  productId: string;
  name: string;
  teacherName: string;
  studyYearName: string;
  price: number;
  count: number;
  paidAmount: number;
  remainingAmount: number;
  waitingCount: number;
};

export type AdminReservationBranchGroup = {
  branchId: string;
  branchName: string;
  count: number;
  paidAmount: number;
  remainingAmount: number;
  waitingCount: number;
  products: AdminReservationProductRow[];
};

export type AdminSalesProductRow = {
  productId: string;
  name: string;
  teacherName: string;
  studyYearName: string;
  price: number;
  count: number;
  quantity: number;
  salesAmount: number;
  returnsAmount: number;
  netAmount: number;
};

export type AdminSalesBranchGroup = {
  branchId: string;
  branchName: string;
  count: number;
  quantity: number;
  salesAmount: number;
  returnsAmount: number;
  netAmount: number;
  products: AdminSalesProductRow[];
};

export type AdminInventoryProductRow = {
  productId: string;
  name: string;
  teacherName: string;
  studyYearName: string;
  price: number;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number | null;
};

export type AdminInventoryBranchGroup = {
  branchId: string;
  branchName: string;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  products: AdminInventoryProductRow[];
};

/** GET /reports/admin/inventory-by-product */
export type AdminInventoryByProductResponse = AdminSectionBase & {
  section: "inventory-by-product";
  branches: AdminInventoryBranchGroup[];
  /** Present when the page branch filter is all branches. */
  productsByProduct: AdminInventoryProductRow[] | null;
};

/** GET /reports/admin/sales-by-product */
export type AdminSalesByProductResponse = AdminSectionBase & {
  section: "sales-by-product";
  branches: AdminSalesBranchGroup[];
  /** Present when the page branch filter is all branches. */
  productsByProduct: AdminSalesProductRow[] | null;
};

/** GET /reports/admin/reservations-by-product */
export type AdminReservationsByProductResponse = AdminSectionBase & {
  section: "reservations-by-product";
  branches: AdminReservationBranchGroup[];
  /** Present when the page branch filter is all branches. */
  productsByBook: AdminReservationProductRow[] | null;
};

// --- Home /reports/general/* ---

/** GET /reports/general/summary */
export type AdminGeneralSummary = {
  branchesCount: number;
  studentsCount: number;
  productsCount: number;
  teachersCount: number;
};

/** GET /reports/general/top-products — nested `product` (+ productId convenience). */
export type AdminGeneralTopProduct = {
  productId: string;
  product: ReportNamedRef;
  salesCount: number;
  salesAmount: number;
};

/** GET /reports/general/recent-operations — flat display strings. */
export type AdminGeneralRecentOperation = {
  id: string;
  time: string;
  type: string;
  student: string;
  product: string;
  amount: number | null;
  branch: string;
};

/** GET /reports/general/payments */
export type AdminGeneralPaymentMethod = ReportPaymentMethod;

export type AdminGeneralSalesTrendPoint = {
  date: string;
  label: string;
  amount: number;
};

/** GET /reports/general/sales-trend */
export type AdminGeneralSalesTrend = {
  branchId: string | null;
  points: AdminGeneralSalesTrendPoint[];
};
