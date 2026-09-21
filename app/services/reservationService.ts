import {
  apiFetch,
  firstRow,
  asData,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import {
  PaymentMethod,
  normalizePaymentMethod,
} from "~/utils/paymentMethods";

/** Body for POST /reservations — matches CreateReservationDto (camelCase only). */
const reservationBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    studentId: payload.studentId,
    productId: payload.productId,
    quantity: Number(payload.quantity || 1),
    deposit: Number(payload.deposit),
    method: normalizePaymentMethod(payload.method || PaymentMethod.CASH),
  };

  if (payload.branchId) body.branchId = payload.branchId;
  if (payload.proofReference) body.proofReference = payload.proofReference;

  return body;
};

export const reservationService = {
  async getReservations(
    params: Record<string, any> = {},
  ): Promise<PaginatedResponse> {
    return asPaginated(
      await apiFetch("/reservations", { method: "GET", params }),
    );
  },

  async getReservation(id: string) {
    return firstRow(await apiFetch(`/reservations/${id}`, { method: "GET" }));
  },

  async createReservation(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/reservations", {
        method: "POST",
        body: reservationBody(payload),
      }),
    );
  },

  async deliverReservation(id: string, payload: Record<string, any> = {}) {
    const body: Record<string, any> = {};

    if (payload.method != null && String(payload.method).trim() !== "") {
      body.method = normalizePaymentMethod(payload.method);
    }

    if (payload.proofReference) body.proofReference = payload.proofReference;

    return firstRow(
      await apiFetch(`/reservations/${id}/deliver`, {
        method: "POST",
        body,
      }),
    );
  },

  async cancelReservation(id: string, payload: Record<string, any> = {}) {
    const body: Record<string, any> = {};

    if (
      payload.refundMethod != null &&
      String(payload.refundMethod).trim() !== ""
    ) {
      body.refundMethod = normalizePaymentMethod(payload.refundMethod);
    }

    if (payload.proofReference) body.proofReference = payload.proofReference;

    return firstRow(
      await apiFetch(`/reservations/${id}/cancel`, {
        method: "POST",
        body,
      }),
    );
  },

  async changeProduct(id: string, payload: Record<string, any>) {
    const body: Record<string, any> = {
      newProductId: payload.newProductId,
    };

    if (
      payload.refundMethod != null &&
      String(payload.refundMethod).trim() !== ""
    ) {
      body.refundMethod = normalizePaymentMethod(payload.refundMethod);
    }

    if (payload.proofReference) body.proofReference = payload.proofReference;

    return firstRow(
      await apiFetch(`/reservations/${id}/change-product`, {
        method: "POST",
        body,
      }),
    );
  },

  async exchangeReservation(id: string, payload: Record<string, any>) {
    return this.changeProduct(id, payload);
  },

  async getTimeline(id: string) {
    return asData(
      await apiFetch(`/reservations/${id}/timeline`, { method: "GET" }),
    );
  },
};
