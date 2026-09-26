import {
  apiFetch,
  apiFetchBlob,
  firstRow,
  asData,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import {
  PaymentMethod,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";
import type {
  ReservationQuery,
  CreateReservationPayload,
  DeliverReservationPayload,
  CancelReservationPayload,
  ChangeProductPayload,
  ReservationResponse,
  DeliverReservationResponse,
  ReservationTimelineResponse,
} from "../types/reservation.types";

export const reservationApi = {
  /** GET /reservations → PaginatedResponse<ReservationResponse> */
  async getReservations(
    params: ReservationQuery = {},
  ): Promise<PaginatedResponse<ReservationResponse>> {
    return asPaginated<ReservationResponse>(
      await apiFetch("/reservations", { method: "GET", params }),
    );
  },

  /** POST /reservations → ReservationResponse | null */
  async createReservation(
    payload: CreateReservationPayload,
  ): Promise<ReservationResponse | null> {
    const body: Record<string, unknown> = {
      studentId: payload.studentId,
      productId: payload.productId,
      quantity: Number(payload.quantity || 1),
      deposit: Number(payload.deposit),
      method: normalizePaymentMethod(payload.method || PaymentMethod.CASH),
    };

    if (payload.branchId) body.branchId = payload.branchId;
    if (payload.proofReference) body.proofReference = payload.proofReference;

    return firstRow<ReservationResponse>(
      await apiFetch("/reservations", {
        method: "POST",
        body,
      }),
    );
  },

  /** POST /reservations/:id/deliver → DeliverReservationResponse | null */
  async deliverReservation(
    id: string,
    payload: DeliverReservationPayload = {},
  ): Promise<DeliverReservationResponse | null> {
    const body: Record<string, unknown> = {};

    if (payload.method != null && String(payload.method).trim() !== "") {
      body.method = normalizePaymentMethod(payload.method);
    }

    if (payload.proofReference) body.proofReference = payload.proofReference;

    return firstRow<DeliverReservationResponse>(
      await apiFetch(`/reservations/${id}/deliver`, {
        method: "POST",
        body,
      }),
    );
  },

  /** POST /reservations/:id/cancel → ReservationResponse | null */
  async cancelReservation(
    id: string,
    payload: CancelReservationPayload = {},
  ): Promise<ReservationResponse | null> {
    const body: Record<string, unknown> = {};

    if (
      payload.refundMethod != null &&
      String(payload.refundMethod).trim() !== ""
    ) {
      body.refundMethod = normalizePaymentMethod(payload.refundMethod);
    }

    if (payload.proofReference) body.proofReference = payload.proofReference;

    return firstRow<ReservationResponse>(
      await apiFetch(`/reservations/${id}/cancel`, {
        method: "POST",
        body,
      }),
    );
  },

  /** POST /reservations/:id/change-product → ReservationResponse | null */
  async changeProduct(
    id: string,
    payload: ChangeProductPayload,
  ): Promise<ReservationResponse | null> {
    const body: Record<string, unknown> = {
      newProductId: payload.newProductId,
    };

    if (
      payload.refundMethod != null &&
      String(payload.refundMethod).trim() !== ""
    ) {
      body.refundMethod = normalizePaymentMethod(payload.refundMethod);
    }

    if (payload.proofReference) body.proofReference = payload.proofReference;

    return firstRow<ReservationResponse>(
      await apiFetch(`/reservations/${id}/change-product`, {
        method: "POST",
        body,
      }),
    );
  },

  /** GET /reservations/:id/timeline → ReservationTimelineResponse */
  async getTimeline(id: string): Promise<ReservationTimelineResponse> {
    return asData<ReservationTimelineResponse>(
      await apiFetch(`/reservations/${id}/timeline`, { method: "GET" }),
    );
  },

  /** GET /reservations/export → Excel blob (admin only) */
  async exportReservations(params: Record<string, unknown> = {}): Promise<Blob> {
    return apiFetchBlob("/reservations/export", {
      method: "GET",
      params,
    });
  },
};

/** @deprecated Prefer `reservationApi` */
export const reservationService = reservationApi;
