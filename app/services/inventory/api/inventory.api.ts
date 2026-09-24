import { apiFetch, asData, asList, asPaginated, firstRow } from "~/utils/apiFetch";
import type { PaginatedResponse } from "~/utils/apiFetch";
import type {
  InventoryQuery,
  StockQuantityPayload,
  InventoryResponse,
  InventorySummaryResponse,
  StockMovementResponse,
  StockMutationResponse,
  InventoryAvailability,
} from "../types/inventory.types";
import { buildBranchInventoryPageQuery } from "../helpers/inventory-list.helper";

export const inventoryApi = {
  /**
   * GET /inventory
   * → InventoryResponse[] | InventorySummaryResponse[] when inventory_summary
   */
  async getInventory(
    params: InventoryQuery = {},
  ): Promise<InventoryResponse[] | InventorySummaryResponse[]> {
    const response = await apiFetch("/inventory", { method: "GET", params });
    if (params.inventory_summary) {
      return Array.isArray(response)
        ? (response as InventorySummaryResponse[])
        : asList<InventorySummaryResponse>(response);
    }
    return asList<InventoryResponse>(response);
  },

  /**
   * GET /inventory/:branchId
   * → InventoryResponse[] | InventorySummaryResponse when inventory_summary
   * → PaginatedResponse when include_sold or page / per_page is set
   */
  async getBranchInventory(
    branchId: string,
    params: InventoryQuery = {},
  ): Promise<
    | InventoryResponse[]
    | InventorySummaryResponse
    | PaginatedResponse<InventoryResponse>
  > {
    const response = await apiFetch(`/inventory/${branchId}`, {
      method: "GET",
      params,
    });
    if (params.inventory_summary) {
      return response as InventorySummaryResponse;
    }
    if (
      params.include_sold ||
      params.page != null ||
      params.per_page != null
    ) {
      return asPaginated<InventoryResponse>(response);
    }
    return asList<InventoryResponse>(response);
  },

  /**
   * GET /inventory/:branchId?include_sold&page&per_page
   * → PaginatedResponse (project list pagination shape)
   */
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

  /** GET /inventory/:branchId?inventory_summary=true → InventorySummaryResponse */
  async getBranchInventorySummary(
    branchId: string,
  ): Promise<InventorySummaryResponse> {
    return this.getBranchInventory(branchId, {
      inventory_summary: true,
    }) as Promise<InventorySummaryResponse>;
  },

  /** GET /inventory?inventory_summary=true → InventorySummaryResponse[] */
  async getInventorySummaries(
    params: InventoryQuery = {},
  ): Promise<InventorySummaryResponse[]> {
    return this.getInventory({
      ...params,
      inventory_summary: true,
    }) as Promise<InventorySummaryResponse[]>;
  },

  /** GET /inventory/:branchId/:productId → InventoryResponse */
  async getStockItem(
    branchId: string,
    productId: string,
  ): Promise<InventoryResponse> {
    return asData<InventoryResponse>(
      await apiFetch(`/inventory/${branchId}/${productId}`, { method: "GET" }),
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

  /** Availability derived from getStockItem. */
  async getAvailability(
    params: {
      branchId?: string;
      productId?: string;
    } = {},
  ): Promise<InventoryAvailability> {
    const branchId = String(params.branchId || "");
    const productId = String(params.productId || "");

    if (!branchId || !productId) {
      return { availableQuantity: 0, physicalQuantity: 0, reservedQuantity: 0 };
    }

    try {
      const item = await this.getStockItem(branchId, productId);
      return {
        availableQuantity: item?.availableQuantity ?? 0,
        physicalQuantity: item?.physicalQuantity ?? 0,
        reservedQuantity: item?.reservedQuantity ?? 0,
      };
    } catch {
      return { availableQuantity: 0, physicalQuantity: 0, reservedQuantity: 0 };
    }
  },

  /** GET /inventory/:branchId/:productId/movements → StockMovementResponse[] */
  async getInventoryMovements(
    branchId: string,
    productId: string,
  ): Promise<StockMovementResponse[]> {
    return asList<StockMovementResponse>(
      await apiFetch(`/inventory/${branchId}/${productId}/movements`, {
        method: "GET",
      }),
    );
  },

  /** Alias of getInventoryMovements. */
  async getMovements(
    branchId: string,
    productId: string,
  ): Promise<StockMovementResponse[]> {
    return this.getInventoryMovements(branchId, productId);
  },
};

/** @deprecated Prefer `inventoryApi` — kept for gradual import migration. */
export const inventoryService = inventoryApi;
