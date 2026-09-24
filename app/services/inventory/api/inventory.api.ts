import { apiFetch, asList, asPaginated, firstRow } from "~/utils/apiFetch";
import type { PaginatedResponse } from "~/utils/apiFetch";
import type {
  InventoryQuery,
  StockQuantityPayload,
  InventoryResponse,
  StockMutationResponse,
} from "../types/inventory.types";
import { buildBranchInventoryPageQuery } from "../helpers/inventory-list.helper";

export const inventoryApi = {
  async getBranchInventory(
    branchId: string,
    params: InventoryQuery = {},
  ): Promise<InventoryResponse[] | PaginatedResponse<InventoryResponse>> {
    const response = await apiFetch(`/inventory/${branchId}`, {
      method: "GET",
      params,
    });
    if (
      params.include_sold ||
      params.page != null ||
      params.per_page != null
    ) {
      return asPaginated<InventoryResponse>(response);
    }
    return asList<InventoryResponse>(response);
  },

  async getBranchInventoryPage(
    branchId: string,
    params: { page?: number; perPage?: number } = {},
  ): Promise<PaginatedResponse<InventoryResponse>> {
    return asPaginated<InventoryResponse>(
      await apiFetch(`/inventory/${branchId}`, {
        method: "GET",
        params: buildBranchInventoryPageQuery({
          page: params.page ?? 1,
          perPage: params.perPage ?? 10,
        }),
      }),
    );
  },

  /** POST /inventory/:branchId/:productId/add → StockMutationResponse | null */
  async addStock(
    payload: StockQuantityPayload,
  ): Promise<StockMutationResponse | null> {
    const branchId = String(payload.branchId || "");
    const productId = String(payload.productId || "");

    if (!branchId || !productId) {
      throw new Error("branchId and productId are required to add stock.");
    }

    return firstRow<StockMutationResponse>(
      await apiFetch(
        `/inventory/${encodeURIComponent(branchId)}/${encodeURIComponent(productId)}/add`,
        {
          method: "POST",
          body: {
            quantity: Number(payload.quantity),
            ...(payload.note ? { note: payload.note } : {}),
          },
        },
      ),
    );
  },

  /** POST /inventory/:branchId/:productId/remove → StockMutationResponse | null */
  async removeStock(
    payload: StockQuantityPayload,
  ): Promise<StockMutationResponse | null> {
    const branchId = String(payload.branchId || "");
    const productId = String(payload.productId || "");

    if (!branchId || !productId) {
      throw new Error("branchId and productId are required to remove stock.");
    }

    return firstRow<StockMutationResponse>(
      await apiFetch(
        `/inventory/${encodeURIComponent(branchId)}/${encodeURIComponent(productId)}/remove`,
        {
          method: "POST",
          body: {
            quantity: Number(payload.quantity),
            ...(payload.note ? { note: payload.note } : {}),
          },
        },
      ),
    );
  },
};
