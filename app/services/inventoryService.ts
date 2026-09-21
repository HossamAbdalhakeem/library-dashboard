import { apiFetch, asData, asList, firstRow } from "~/utils/apiFetch";

export const inventoryService = {
  async getInventory(params: Record<string, any> = {}) {
    const response = await apiFetch("/inventory", { method: "GET", params });
    if (params.inventory_summary) {
      return Array.isArray(response) ? response : asList(response);
    }
    return asList(response);
  },

  async getBranchInventory(
    branchId: string,
    params: Record<string, any> = {},
  ) {
    const response = await apiFetch(`/inventory/${branchId}`, {
      method: "GET",
      params,
    });
    if (params.inventory_summary) {
      return response;
    }
    return asList(response);
  },

  async getBranchInventorySummary(branchId: string) {
    return this.getBranchInventory(branchId, { inventory_summary: true });
  },

  async getInventorySummaries(params: Record<string, any> = {}) {
    return this.getInventory({ ...params, inventory_summary: true });
  },

  async getStockItem(branchId: string, productId: string) {
    return asData(
      await apiFetch(`/inventory/${branchId}/${productId}`, { method: "GET" }),
    );
  },

  async addStock(payload: Record<string, any>) {
    const branchId = String(payload.branchId || "");
    const productId = String(payload.productId || "");

    if (!branchId || !productId) {
      throw new Error("branchId and productId are required to add stock.");
    }

    return firstRow(
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

  async removeStock(payload: Record<string, any>) {
    const branchId = String(payload.branchId || "");
    const productId = String(payload.productId || "");

    if (!branchId || !productId) {
      throw new Error("branchId and productId are required to remove stock.");
    }

    return firstRow(
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

  async getAvailability(params: Record<string, any> = {}) {
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

  async getInventoryMovements(branchId: string, productId: string) {
    return asList(
      await apiFetch(`/inventory/${branchId}/${productId}/movements`, {
        method: "GET",
      }),
    );
  },

  async getMovements(branchId: string, productId: string) {
    return this.getInventoryMovements(branchId, productId);
  },
};
