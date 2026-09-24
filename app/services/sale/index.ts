export { saleApi, saleService } from "./api/sale.api";

export type {
  NamedRef,
  AcademicYearRef,
  StudentRef,
  CreatedByRef,
  SaleProductRef,
  PaymentImageRef,
  SalePaymentRef,
  SaleItemResponse,
  SaleReturnBrief,
  SaleExchangeBrief,
  SaleResponse,
  SalePayload,
  SaleTimelineEventType,
  SaleTimelineEvent,
  SaleTimelineResponse,
} from "./types/sale.types";

export {
  buildSalePayload,
  normalizeSaleDetail,
  mapSaleToSuccessSummary,
} from "./helpers/sale-form.helper";
