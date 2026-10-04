import { apiFetch, apiFetchBlob, asData } from "~/utils/apiFetch";
import { buildGeneralSalesTrendQuery } from "../helpers/admin-reports.helper";
import type {
  AdminReportQuery,
  AdminSummaryResponse,
  AdminSalesTrendResponse,
  AdminProfitLossResponse,
  AdminPaymentMethodsResponse,
  AdminSalesResponse,
  AdminReservationsByProductResponse,
  AdminSalesByProductResponse,
  AdminInventoryByProductResponse,
  AdminGeneralSummary,
  AdminGeneralPaymentMethod,
  AdminGeneralTopProduct,
  AdminGeneralRecentOperation,
  AdminGeneralSalesTrend,
} from "../types/admin-reports.types";

export const adminReportsApi = {
  // --- Modular /admin-api/reports/admin/* ---

  async getSummary(
    params: AdminReportQuery = {},
  ): Promise<AdminSummaryResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/summary", { method: "GET", params }),
    );
  },

  async getSalesTrend(
    params: AdminReportQuery = {},
  ): Promise<AdminSalesTrendResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/sales-trend", { method: "GET", params }),
    );
  },

  async getProfitLoss(
    params: AdminReportQuery = {},
  ): Promise<AdminProfitLossResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/profit-loss", { method: "GET", params }),
    );
  },

  async getPaymentMethods(
    params: AdminReportQuery = {},
  ): Promise<AdminPaymentMethodsResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/payment-methods", {
        method: "GET",
        params,
      }),
    );
  },

  async getSales(
    params: AdminReportQuery = {},
  ): Promise<AdminSalesResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/sales", {
        method: "GET",
        params,
      }),
    );
  },

  async getReservationsByProduct(
    params: AdminReportQuery = {},
  ): Promise<AdminReservationsByProductResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/reservations-by-product", {
        method: "GET",
        params,
      }),
    );
  },

  async exportReservationsByProduct(
    params: AdminReportQuery = {},
  ): Promise<Blob> {
    return apiFetchBlob("/admin-api/reports/admin/reservations-by-product/export", {
      method: "GET",
      params,
    });
  },

  async getSalesByProduct(
    params: AdminReportQuery = {},
  ): Promise<AdminSalesByProductResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/sales-by-product", {
        method: "GET",
        params,
      }),
    );
  },

  async exportSalesByProduct(
    params: AdminReportQuery = {},
  ): Promise<Blob> {
    return apiFetchBlob("/admin-api/reports/admin/sales-by-product/export", {
      method: "GET",
      params,
    });
  },

  async getInventoryByProduct(
    params: AdminReportQuery = {},
  ): Promise<AdminInventoryByProductResponse> {
    return asData(
      await apiFetch("/admin-api/reports/admin/inventory-by-product", {
        method: "GET",
        params,
      }),
    );
  },

  async exportInventoryByProduct(
    params: AdminReportQuery = {},
  ): Promise<Blob> {
    return apiFetchBlob("/admin-api/reports/admin/inventory-by-product/export", {
      method: "GET",
      params,
    });
  },

  // --- Home /admin-api/reports/general/* ---

  async getGeneralSummary(): Promise<AdminGeneralSummary> {
    return asData(
      await apiFetch("/admin-api/reports/general/summary", { method: "GET" }),
    );
  },

  async getGeneralPayments(): Promise<AdminGeneralPaymentMethod[]> {
    return asData(
      await apiFetch("/admin-api/reports/general/payments", { method: "GET" }),
    );
  },

  async getGeneralTopProducts(): Promise<AdminGeneralTopProduct[]> {
    return asData(
      await apiFetch("/admin-api/reports/general/top-products", { method: "GET" }),
    );
  },

  async getGeneralRecentOperations(): Promise<AdminGeneralRecentOperation[]> {
    return asData(
      await apiFetch("/admin-api/reports/general/recent-operations", { method: "GET" }),
    );
  },

  async getGeneralSalesTrend(
    params: AdminReportQuery = {},
  ): Promise<AdminGeneralSalesTrend> {
    return asData(
      await apiFetch("/admin-api/reports/general/sales-trend", {
        method: "GET",
        params: buildGeneralSalesTrendQuery(params),
      }),
    );
  },
};

/** @deprecated Prefer `adminReportsApi` */
export const adminReportsService = adminReportsApi;
