import { apiFetch, firstRow, asList, asData } from "~/utils/apiFetch";
import {
  PaymentMethod,
  normalizePaymentMethod,
} from "~/utils/paymentMethods";

/** Body for POST /sales — matches CreateSaleDto (camelCase only). */
const saleBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    studentId: payload.studentId,
    productId: payload.productId,
    quantity: Number(payload.quantity || 1),
    method: normalizePaymentMethod(payload.method || PaymentMethod.CASH),
  };

  if (payload.proofReference) body.proofReference = payload.proofReference;

  return body;
};

export const saleService = {
  async getSales(params: Record<string, any> = {}) {
    return asList(await apiFetch("/sales", { method: "GET", params }));
  },

  async getSale(id: string) {
    return firstRow(await apiFetch(`/sales/${id}`, { method: "GET" }));
  },

  async createSale(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/sales", {
        method: "POST",
        body: saleBody(payload),
      }),
    );
  },

  async getTimeline(id: string) {
    return asData(await apiFetch(`/sales/${id}/timeline`, { method: "GET" }));
  },
};
