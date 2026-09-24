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
  academicYearId?: string;
};

type AdminSectionBase = {
  section: string;
  scope: "admin";
  from?: string;
  to?: string;
  filters?: AdminReportFilters;
};

/** GET /reports/admin/kpis */
export type AdminKpisResponse = AdminSectionBase & {
  section: "kpis";
  summary: {
    sales: number;
    salesAmount: number;
    reservations: number;
    reservationsPaidAmount: number;
    reservationDeposits: number;
    inventoryTotal: number;
  };
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

/** GET /reports/admin/revenue | /sales */
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

/** GET /reports/admin/payments (legacy alias + refunds) */
export type AdminPaymentsResponse = Omit<
  AdminPaymentMethodsResponse,
  "section"
> & {
  section: "payments";
};

export type AdminInventoryBucket = {
  type: string;
  total: number;
  reserved: number;
  available: number;
};

/** GET /reports/admin/inventory */
export type AdminInventoryResponse = AdminSectionBase & {
  section: "inventory";
  summary: {
    total: number;
    reserved: number;
    available: number;
    lowStock: number;
    outOfStock: number;
  };
  byType: AdminInventoryBucket[];
  /** Present on legacy inventory-by-type shape */
  inventoryTotal?: number;
  books?: AdminInventoryBucket;
  cards?: AdminInventoryBucket;
  booklets?: AdminInventoryBucket;
};

export type AdminProductPerformanceRow = {
  productId: string;
  productName: string;
  quantitySold: number;
  salesAmount: number;
  profit: number;
  remainingQuantity: number;
};

/** GET /reports/admin/products */
export type AdminProductsResponse = AdminSectionBase & {
  section: "products";
  products: AdminProductPerformanceRow[];
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

export type AdminExpenseByBranch = {
  branchId: string | null;
  branchName: string;
  amount: number;
};

export type AdminExpenseByType = {
  type: string;
  amount: number;
};

/** GET /reports/admin/expenses */
export type AdminExpensesResponse = AdminSectionBase & {
  section: "expenses";
  totalExpenses: number;
  salesRelatedExpenses: number;
  generalExpenses: number;
  expensesByBranch: AdminExpenseByBranch[];
  expensesByType: AdminExpenseByType[];
  count: number;
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
