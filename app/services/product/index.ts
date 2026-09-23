export { productApi, productService } from "./api/product.api";

export type {
  NamedRef,
  AcademicYearRef,
  ProductType,
  ProductStatus,
  ProductAvailabilityStatus,
  ProductResponse,
  ProductSearchBranch,
  ProductSearchResponse,
  ProductQuery,
  ProductSearchQuery,
  ProductPayload,
  ProductUpdatePayload,
  ProductStatusPayload,
  ProductListItem,
} from "./types/product.types";

export {
  emptyProductForm,
  calcProfitPercentage,
  mapProductToForm,
  buildProductPayload,
  validateProductForm,
} from "./helpers/product-form.helper";

export {
  normalizeProductListItem,
  buildProductListQuery,
} from "./helpers/product-list.helper";
