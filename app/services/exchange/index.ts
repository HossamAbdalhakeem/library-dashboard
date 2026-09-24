export { exchangeApi, exchangeService } from "./api/exchange.api";

export type {
  NamedRef,
  AcademicYearRef,
  TeacherBrief,
  StudentBrief,
  CreatedByRef,
  ExchangeProductRef,
  PaymentImageRef,
  ExchangePaymentRef,
  ExchangeRefundRef,
  ExchangeDiffKind,
  ExchangeResponse,
  ExchangePreviewResponse,
  EligibleSaleQuantity,
  EligibleSaleProduct,
  EligibleSaleItemExchange,
  EligibleSaleItem,
  EligibleSaleQuantitySummary,
  EligibleSaleResponse,
  EligibleSaleListItem,
  ExchangeFlowSale,
  EligibleSalesQuery,
  ExchangePreviewPayload,
  ExchangeCreatePayload,
} from "./types/exchange.types";

export {
  normalizeEligibleSale,
  normalizeEligibleSaleItem,
  buildEligibleSalesQuery,
} from "./helpers/exchange-list.helper";

export {
  toExchangeFlowSale,
  normalizeExchangePreview,
} from "./helpers/exchange-form.helper";
