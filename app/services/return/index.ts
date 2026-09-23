export { returnApi, returnService } from "./api/return.api";

export type {
  NamedRef,
  AcademicYearRef,
  StudentRef,
  CreatedByRef,
  ReturnProductRef,
  ReturnSaleItemRef,
  ReturnItemResponse,
  ReturnRefundRef,
  ReturnResponse,
  ReturnQuery,
  ReturnItemPayload,
  ReturnPayload,
  ReturnListItem,
} from "./types/return.types";

export {
  emptyReturnForm,
  mapReturnToForm,
  buildReturnPayload,
  validateReturnForm,
} from "./helpers/return-form.helper";

export {
  normalizeReturnListItem,
  buildReturnListQuery,
} from "./helpers/return-list.helper";
