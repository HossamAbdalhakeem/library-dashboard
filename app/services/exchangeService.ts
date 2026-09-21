import { apiFetch, asData, asList, asPaginated, firstRow, type PaginatedResponse } from "~/utils/apiFetch";
import { normalizePaymentMethod } from "~/utils/paymentMethods";

export const exchangeService = {
  async getEligibleSales(
    params: Record<string, any> = {},
  ): Promise<PaginatedResponse> {
    return asPaginated(
      await apiFetch("/exchanges/eligible-sales", {
        method: "GET",
        params,
      }),
    );
  },

  async previewExchange(payload: Record<string, any>) {
    return asData(
      await apiFetch("/exchanges/preview", {
        method: "POST",
        body: {
          saleId: payload.saleId ?? payload.sale_id,
          saleItemId: payload.saleItemId ?? payload.sale_item_id,
          newProductId: payload.newProductId ?? payload.new_product_id,
          quantity: Number(payload.quantity || 1),
        },
      }),
    );
  },

  async getExchanges(params: Record<string, any> = {}) {
    return asList(await apiFetch("/exchanges", { method: "GET", params }));
  },

  async getExchange(id: string) {
    return firstRow(await apiFetch(`/exchanges/${id}`, { method: "GET" }));
  },

  async createExchange(payload: Record<string, any>) {
    const body: Record<string, any> = {
      saleId: payload.saleId ?? payload.sale_id,
      saleItemId: payload.saleItemId ?? payload.sale_item_id,
      newProductId: payload.newProductId ?? payload.new_product_id,
      quantity: Number(payload.quantity || 1),
    };

    if (payload.paymentMethod || payload.payment_method) {
      body.paymentMethod = normalizePaymentMethod(
        payload.paymentMethod ?? payload.payment_method,
      );
    }

    if (payload.refundMethod || payload.refund_method) {
      body.refundMethod = normalizePaymentMethod(
        payload.refundMethod ?? payload.refund_method,
      );
    }

    const proof =
      payload.proofReference ??
      payload.proof_reference ??
      payload.payment_proof_path;

    if (proof) body.proofReference = proof;

    return firstRow(
      await apiFetch("/exchanges", {
        method: "POST",
        body,
      }),
    );
  },
};
