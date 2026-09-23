import {
  apiFetch,
  firstRow,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import type {
  ProductQuery,
  ProductSearchQuery,
  ProductPayload,
  ProductUpdatePayload,
  ProductStatusPayload,
  ProductResponse,
  ProductSearchResponse,
} from "../types/product.types";

export const productApi = {
  /** GET /products → PaginatedResponse<ProductResponse> */
  async getProducts(
    params: ProductQuery = {},
  ): Promise<PaginatedResponse<ProductResponse>> {
    return asPaginated<ProductResponse>(
      await apiFetch("/products", { method: "GET", params }),
    );
  },

  /** GET /products/search → PaginatedResponse<ProductSearchResponse> */
  async searchProducts(
    params: ProductSearchQuery = {},
  ): Promise<PaginatedResponse<ProductSearchResponse>> {
    return asPaginated<ProductSearchResponse>(
      await apiFetch("/products/search", { method: "GET", params }),
    );
  },

  /** GET /products/:id → ProductResponse | null */
  async getProduct(id: string): Promise<ProductResponse | null> {
    return firstRow<ProductResponse>(
      await apiFetch(`/products/${id}`, { method: "GET" }),
    );
  },

  /** POST /products → ProductResponse | null */
  async createProduct(
    payload: ProductPayload,
  ): Promise<ProductResponse | null> {
    return firstRow<ProductResponse>(
      await apiFetch("/products", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /products/:id → ProductResponse | null */
  async updateProduct(
    id: string,
    payload: ProductUpdatePayload,
  ): Promise<ProductResponse | null> {
    return firstRow<ProductResponse>(
      await apiFetch(`/products/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** PATCH /products/:id/status → ProductResponse | null */
  async updateProductStatus(
    id: string,
    payload: ProductStatusPayload,
  ): Promise<ProductResponse | null> {
    return firstRow<ProductResponse>(
      await apiFetch(`/products/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `productApi` — kept for gradual import migration. */
export const productService = productApi;
