import { productApi } from "~/services/product";
import { ProductType } from "~/enums/productType";
import type { PaginatedResponse } from "~/utils/apiFetch";
import type {
  BookSearchQuery,
  BookSearchResponse,
} from "../types/book.types";

export const bookApi = {
  /** GET /products/search?type=BOOK → PaginatedResponse<BookSearchResponse> */
  async searchBooks(
    params: BookSearchQuery = {},
  ): Promise<PaginatedResponse<BookSearchResponse>> {
    return productApi.searchProducts({
      ...params,
      type: ProductType.BOOK,
    }) as Promise<PaginatedResponse<BookSearchResponse>>;
  },
};

/** @deprecated Prefer `bookApi` */
export const bookService = bookApi;
