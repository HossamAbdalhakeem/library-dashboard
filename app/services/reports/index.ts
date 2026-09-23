export {
  adminReportsApi,
  adminReportsService,
} from "./admin";
export type {
  AdminReportQuery,
  AdminKpisResponse,
  AdminSummaryResponse,
  AdminRevenueResponse,
  AdminSalesTrendResponse,
  AdminProfitLossResponse,
  AdminPaymentMethodsResponse,
  AdminPaymentsResponse,
  AdminInventoryResponse,
  AdminProductsResponse,
  AdminBranchesResponse,
  AdminReturnsExchangesResponse,
  AdminExpensesResponse,
  AdminGeneralSummary,
  AdminGeneralTopProduct,
  AdminGeneralRecentOperation,
  AdminGeneralPaymentMethod,
  AdminGeneralSalesTrend,
} from "./admin";

export { branchReportsApi } from "./branch";
export type {
  BranchReportQuery,
  BranchDailySummaryResponse,
  BranchSectionResponse,
  BranchOperationTimeline,
  BranchStudentOperationsSection,
} from "./branch";

export { customerServiceReportsApi } from "./customer-service";
export type {
  CustomerServiceReportQuery,
  CustomerServiceDailySummaryResponse,
  CustomerServiceSectionResponse,
  CustomerServiceOperationTimeline,
} from "./customer-service";
