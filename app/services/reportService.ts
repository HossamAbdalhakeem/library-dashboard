import { apiFetch, asData, asList } from "~/utils/apiFetch";

const todayRange = () => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

export type DailyReportKind = "branch" | "customer-service";

export type DailyReportSection =
  | "summary"
  | "sales"
  | "reservations"
  | "delivered"
  | "cancelled"
  | "received"
  | "stockOut"
  | "allMovements"
  | "stockOperations"
  | "studentOperations"
  | "returns"
  | "exchanges";

const BRANCH_SECTION_PATH: Record<
  Exclude<DailyReportSection, "summary">,
  string
> = {
  sales: "sales",
  reservations: "reservations",
  delivered: "delivered",
  cancelled: "cancelled",
  received: "received",
  stockOut: "stock-out",
  allMovements: "all-movements",
  stockOperations: "stock-operations",
  studentOperations: "student-operations",
  returns: "returns",
  exchanges: "exchanges",
};

const CUSTOMER_SERVICE_SECTION_PATH: Record<
  "reservations" | "delivered" | "cancelled" | "studentOperations",
  string
> = {
  reservations: "reservations",
  delivered: "delivered",
  cancelled: "cancelled",
  studentOperations: "student-operations",
};

const withDefaultRange = (params: Record<string, any> = {}) => ({
  ...todayRange(),
  ...params,
});

export const reportService = {
  async getBranchSummary(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/branch/summary", {
        method: "GET",
        params: withDefaultRange(params),
      }),
    );
  },

  async getBranchSection(
    section: Exclude<DailyReportSection, "summary">,
    params: Record<string, any> = {},
  ) {
    const path = BRANCH_SECTION_PATH[section];
    if (!path) {
      throw new Error(`Unsupported branch report section: ${section}`);
    }
    const response = await apiFetch(`/reports/branch/${path}`, {
      method: "GET",
      params: withDefaultRange(params),
    });

    // Paginated section payloads use top-level `data` + `pagination`.
    // Do not unwrap with asData() or the list/pagination are lost.
    if (
      response &&
      typeof response === "object" &&
      "pagination" in response &&
      Array.isArray((response as any).data)
    ) {
      return response;
    }
    if (
      response?.data &&
      typeof response.data === "object" &&
      "pagination" in response.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data;
    }

    return asData(response);
  },

  async getBranchOperationTimeline(operationId: string) {
    return asData(
      await apiFetch(
        `/reports/branch/student-operations/${encodeURIComponent(operationId)}/timeline`,
        { method: "GET" },
      ),
    );
  },

  async getCustomerServiceOperationTimeline(operationId: string) {
    return asData(
      await apiFetch(
        `/reports/customer-service/student-operations/${encodeURIComponent(operationId)}/timeline`,
        { method: "GET" },
      ),
    );
  },

  async getCustomerServiceSummary(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/customer-service/summary", {
        method: "GET",
        params: withDefaultRange(params),
      }),
    );
  },

  async getCustomerServiceSection(
    section: "reservations" | "delivered" | "cancelled" | "studentOperations",
    params: Record<string, any> = {},
  ) {
    const path = CUSTOMER_SERVICE_SECTION_PATH[section];
    if (!path) {
      throw new Error(`Unsupported customer-service report section: ${section}`);
    }
    const response = await apiFetch(`/reports/customer-service/${path}`, {
      method: "GET",
      params: withDefaultRange(params),
    });

    if (
      response &&
      typeof response === "object" &&
      "pagination" in response &&
      Array.isArray((response as any).data)
    ) {
      return response;
    }
    if (
      response?.data &&
      typeof response.data === "object" &&
      "pagination" in response.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data;
    }

    return asData(response);
  },

  /** Role-scoped daily summary (branch | customer-service) */
  async getDailyReport(
    kind: DailyReportKind,
    params: Record<string, any> = {},
  ) {
    if (kind === "customer-service") {
      return this.getCustomerServiceSummary(params);
    }
    return this.getBranchSummary(params);
  },

  /** Role-scoped daily detail section */
  async getDailyReportSection(
    kind: DailyReportKind,
    section: Exclude<DailyReportSection, "summary">,
    params: Record<string, any> = {},
  ) {
    if (kind === "customer-service") {
      if (
        section !== "reservations" &&
        section !== "delivered" &&
        section !== "cancelled" &&
        section !== "studentOperations"
      ) {
        throw new Error(
          `Unsupported customer-service report section: ${section}`,
        );
      }
      return this.getCustomerServiceSection(section, params);
    }
    return this.getBranchSection(section, params);
  },

  /** Admin modular section APIs */
  async getAdminKpis(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/kpis", { method: "GET", params }),
    );
  },

  async getAdminSummary(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/summary", { method: "GET", params }),
    );
  },

  async getAdminRevenue(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/revenue", { method: "GET", params }),
    );
  },

  /** Alias for getAdminRevenue (sales = gross − returns = net). */
  async getAdminSales(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/sales", { method: "GET", params }),
    );
  },

  async getAdminSalesTrend(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/sales-trend", { method: "GET", params }),
    );
  },

  async getAdminProfitLoss(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/profit-loss", { method: "GET", params }),
    );
  },

  async getAdminPaymentMethods(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/payment-methods", {
        method: "GET",
        params,
      }),
    );
  },

  async getAdminInventory(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/inventory", { method: "GET", params }),
    );
  },

  async getAdminProducts(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/products", { method: "GET", params }),
    );
  },

  async getAdminBranches(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/branches", { method: "GET", params }),
    );
  },

  async getAdminReturnsExchanges(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/returns-exchanges", {
        method: "GET",
        params,
      }),
    );
  },

  async getAdminExpenses(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/expenses", { method: "GET", params }),
    );
  },

  async getAdminPayments(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/admin/payments", { method: "GET", params }),
    );
  },

  async getSalesReport(params: Record<string, any> = {}) {
    return asList(await apiFetch("/reports/sales", { method: "GET", params }));
  },

  async getReservationReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/reservations", { method: "GET", params }),
    );
  },

  async getInventoryReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/inventory", { method: "GET", params }),
    );
  },

  async getStockMovementsReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/stock-movements", { method: "GET", params }),
    );
  },

  async getExpensesReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/expenses", { method: "GET", params }),
    );
  },

  async getFinancialReport(params: Record<string, any> = {}) {
    return asData(
      await apiFetch("/reports/financial", { method: "GET", params }),
    );
  },

  async getGeneralSummary() {
    return asData(await apiFetch("/reports/general/summary", { method: "GET" }));
  },

  async getGeneralPayments() {
    return asData(
      await apiFetch("/reports/general/payments", { method: "GET" }),
    );
  },

  async getGeneralTopProducts() {
    return asData(
      await apiFetch("/reports/general/top-products", { method: "GET" }),
    );
  },

  async getGeneralRecentOperations() {
    return asData(
      await apiFetch("/reports/general/recent-operations", { method: "GET" }),
    );
  },

  async getGeneralSalesTrend(params: Record<string, any> = {}) {
    const query = { ...params };
    if (!query.branchId) delete query.branchId;
    return asData(
      await apiFetch("/reports/general/sales-trend", {
        method: "GET",
        params: query,
      }),
    );
  },
};
