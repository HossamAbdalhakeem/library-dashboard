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
  SaleQuery,
  SalePayload,
  SaleListItem,
  SaleTimelineEventType,
  SaleTimelineEvent,
  SaleTimelineResponse,
} from "./types/sale.types";

export {
  emptySaleForm,
  buildSalePayload,
  validateSaleForm,
  normalizeSaleDetail,
  mapSaleToSuccessSummary,
} from "./helpers/sale-form.helper";

export {
  normalizeSaleListItem,
  buildSaleListQuery,
} from "./helpers/sale-list.helper";
