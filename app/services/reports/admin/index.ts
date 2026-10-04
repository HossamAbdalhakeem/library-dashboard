export {
  adminReportsApi,
  adminReportsService,
} from "./api/admin-reports.api";

export type {
  AdminReportQuery,
  AdminReportFilters,
  AdminSummaryResponse,
  AdminSalesTrendPoint,
  AdminSalesTrendResponse,
  AdminProfitLossResponse,
  AdminPaymentMethodItem,
  AdminPaymentMethodsResponse,
  AdminSalesResponse,
  AdminReservationProductRow,
  AdminReservationBranchGroup,
  AdminReservationsByProductResponse,
  AdminSalesProductRow,
  AdminSalesBranchGroup,
  AdminSalesByProductResponse,
  AdminInventoryProductRow,
  AdminInventoryBranchGroup,
  AdminInventoryByProductResponse,
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
