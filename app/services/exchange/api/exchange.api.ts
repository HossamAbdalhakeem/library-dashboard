import {
  apiFetch,
  asData,
  asPaginated,
  firstRow,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import { normalizePaymentMethod } from "~/enums/paymentMethod";
import type {
  EligibleSalesQuery,
  ExchangePreviewPayload,
  ExchangeCreatePayload,
  ExchangeResponse,
  ExchangePreviewResponse,
  EligibleSaleResponse,
} from "../types/exchange.types";

export const exchangeApi = {
  /** GET /exchanges/eligible-sales → PaginatedResponse<EligibleSaleResponse> */
  async getEligibleSales(
    params: EligibleSalesQuery = {},
  ): Promise<PaginatedResponse<EligibleSaleResponse>> {
    return asPaginated<EligibleSaleResponse>(
      await apiFetch("/exchanges/eligible-sales", {
        method: "GET",
        params,
      }),
    );
  },

  /** POST /exchanges/preview → ExchangePreviewResponse */
  async previewExchange(
    payload: ExchangePreviewPayload,
  ): Promise<ExchangePreviewResponse> {
    return asData<ExchangePreviewResponse>(
      await apiFetch("/exchanges/preview", {
        method: "POST",
        body: {
          saleId: payload.saleId,
          saleItemId: payload.saleItemId,
          newProductId: payload.newProductId,
          quantity: Number(payload.quantity || 1),
        },
      }),
    );
  },

  /** POST /exchanges → ExchangeResponse | null */
  async createExchange(
    payload: ExchangeCreatePayload,
  ): Promise<ExchangeResponse | null> {
    const body: Record<string, unknown> = {
      saleId: payload.saleId,
      saleItemId: payload.saleItemId,
      newProductId: payload.newProductId,
      quantity: Number(payload.quantity || 1),
    };

    if (payload.paymentMethod) {
      body.paymentMethod = normalizePaymentMethod(payload.paymentMethod);
    }

    if (payload.refundMethod) {
      body.refundMethod = normalizePaymentMethod(payload.refundMethod);
    }

    if (payload.proofReference) {
      body.proofReference = payload.proofReference;
    }

    return firstRow<ExchangeResponse>(
      await apiFetch("/exchanges", {
        method: "POST",
        body,
      }),
    );
  },
};

/** @deprecated Prefer `exchangeApi` */
export const exchangeService = exchangeApi;
