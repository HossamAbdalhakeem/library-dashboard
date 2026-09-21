import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import { normalizePaymentMethod } from "~/utils/paymentMethods";

export const returnService = {
  async getReturns(params: Record<string, any> = {}) {
    return asList(await apiFetch("/returns", { method: "GET", params }));
  },

  async getReturn(id: string) {
    return firstRow(await apiFetch(`/returns/${id}`, { method: "GET" }));
  },

  async createReturn(payload: Record<string, any>) {
    const items = Array.isArray(payload.items)
      ? payload.items.map((item: Record<string, any>) => ({
          saleItemId: item.saleItemId,
          quantity: Number(item.quantity || 1),
        }))
      : [
          {
            saleItemId: payload.saleItemId,
            quantity: Number(payload.quantity || 1),
          },
        ];

    const body: Record<string, any> = {
      saleId: payload.saleId,
      items,
      method: normalizePaymentMethod(payload.method),
    };

    if (payload.proofReference) {
      body.proofReference = payload.proofReference;
    }

    return firstRow(
      await apiFetch("/returns", {
        method: "POST",
        body,
      }),
    );
  },
};
