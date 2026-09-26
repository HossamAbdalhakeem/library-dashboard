export {
  adminReportsApi,
  adminReportsService,
} from "./api/admin-reports.api";

export type {
  AdminReportQuery,
  AdminReportFilters,
  AdminSummaryResponse,
  AdminRevenueResponse,
  AdminSalesTrendPoint,
  AdminSalesTrendResponse,
  AdminProfitLossResponse,
  AdminPaymentMethodItem,
  AdminPaymentMethodsResponse,
  AdminBranchPerformanceRow,
  AdminBranchesResponse,
  AdminReturnsExchangesResponse,
  AdminExpenseByBranch,
  AdminExpenseByType,
  AdminExpensesResponse,
  AdminGeneralSummary,
  AdminGeneralTopProduct,
  AdminGeneralRecentOperation,
  AdminGeneralPaymentMethod,
  AdminGeneralSalesTrendPoint,
  AdminGeneralSalesTrend,
} from "./types/admin-reports.types";

export {
  buildGeneralSalesTrendQuery,
  extractPaymentMethodItems,
  extractGeneralTopProducts,
} from "./helpers/admin-reports.helper";
