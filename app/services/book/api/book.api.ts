import { productApi } from "~/services/product";
import { ProductType } from "~/enums/productType";
import type { PaginatedResponse } from "~/utils/apiFetch";
import type {
  BookQuery,
  BookSearchQuery,
  BookResponse,
  BookSearchResponse,
} from "../types/book.types";

export const bookApi = {
  /** GET /products?type=BOOK → PaginatedResponse<BookResponse> */
  async getBooks(
    params: BookQuery = {},
  ): Promise<PaginatedResponse<BookResponse>> {
    return productApi.getProducts({
      ...params,
      type: ProductType.BOOK,
    }) as Promise<PaginatedResponse<BookResponse>>;
  },

  /** GET /products/search?type=BOOK → PaginatedResponse<BookSearchResponse> */
  async searchBooks(
    params: BookSearchQuery = {},
  ): Promise<PaginatedResponse<BookSearchResponse>> {
    return productApi.searchProducts({
      ...params,
      type: ProductType.BOOK,
    }) as Promise<PaginatedResponse<BookSearchResponse>>;
  },

  /** GET /products/:id → BookResponse | null */
  async getBook(id: string): Promise<BookResponse | null> {
    return productApi.getProduct(id) as Promise<BookResponse | null>;
  },
};

/** @deprecated Prefer `bookApi` */
export const bookService = bookApi;
