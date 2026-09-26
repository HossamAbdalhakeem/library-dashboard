import { apiFetch, asData } from "~/utils/apiFetch";
import { buildGeneralSalesTrendQuery } from "../helpers/admin-reports.helper";
import type {
  AdminReportQuery,
  AdminSummaryResponse,
  AdminRevenueResponse,
  AdminSalesTrendResponse,
  AdminProfitLossResponse,
  AdminPaymentMethodsResponse,
  AdminBranchesResponse,
  AdminReturnsExchangesResponse,
  AdminExpensesResponse,
  AdminGeneralSummary,
  AdminGeneralPaymentMethod,
  AdminGeneralTopProduct,
  AdminGeneralRecentOperation,
  AdminGeneralSalesTrend,
} from "../types/admin-reports.types";

export const adminReportsApi = {
  // --- Modular /reports/admin/* ---

  async getSummary(
    params: AdminReportQuery = {},
  ): Promise<AdminSummaryResponse> {
    return asData(
      await apiFetch("/reports/admin/summary", { method: "GET", params }),
    );
  },

  async getRevenue(
    params: AdminReportQuery = {},
  ): Promise<AdminRevenueResponse> {
    return asData(
      await apiFetch("/reports/admin/revenue", { method: "GET", params }),
    );
  },

  async getSalesTrend(
    params: AdminReportQuery = {},
  ): Promise<AdminSalesTrendResponse> {
    return asData(
      await apiFetch("/reports/admin/sales-trend", { method: "GET", params }),
    );
  },

  async getProfitLoss(
    params: AdminReportQuery = {},
  ): Promise<AdminProfitLossResponse> {
    return asData(
      await apiFetch("/reports/admin/profit-loss", { method: "GET", params }),
    );
  },

  async getPaymentMethods(
    params: AdminReportQuery = {},
  ): Promise<AdminPaymentMethodsResponse> {
    return asData(
      await apiFetch("/reports/admin/payment-methods", {
        method: "GET",
        params,
      }),
    );
  },

  async getBranches(
    params: AdminReportQuery = {},
  ): Promise<AdminBranchesResponse> {
    return asData(
      await apiFetch("/reports/admin/branches", { method: "GET", params }),
    );
  },

  async getReturnsExchanges(
    params: AdminReportQuery = {},
  ): Promise<AdminReturnsExchangesResponse> {
    return asData(
      await apiFetch("/reports/admin/returns-exchanges", {
        method: "GET",
        params,
      }),
    );
  },

  async getExpenses(
    params: AdminReportQuery = {},
  ): Promise<AdminExpensesResponse> {
    return asData(
      await apiFetch("/reports/admin/expenses", { method: "GET", params }),
    );
  },

  // --- Home /reports/general/* ---

  async getGeneralSummary(): Promise<AdminGeneralSummary> {
    return asData(
      await apiFetch("/reports/general/summary", { method: "GET" }),
    );
  },

  async getGeneralPayments(): Promise<AdminGeneralPaymentMethod[]> {
    return asData(
      await apiFetch("/reports/general/payments", { method: "GET" }),
    );
  },

  async getGeneralTopProducts(): Promise<AdminGeneralTopProduct[]> {
    return asData(
      await apiFetch("/reports/general/top-products", { method: "GET" }),
    );
  },

  async getGeneralRecentOperations(): Promise<AdminGeneralRecentOperation[]> {
    return asData(
      await apiFetch("/reports/general/recent-operations", { method: "GET" }),
    );
  },

  async getGeneralSalesTrend(
    params: AdminReportQuery = {},
  ): Promise<AdminGeneralSalesTrend> {
    return asData(
      await apiFetch("/reports/general/sales-trend", {
        method: "GET",
        params: buildGeneralSalesTrendQuery(params),
      }),
    );
  },
};

/** @deprecated Prefer `adminReportsApi` */
export const adminReportsService = adminReportsApi;
