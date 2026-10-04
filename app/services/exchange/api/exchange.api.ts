import {
  apiFetch,
  asData,
  asPaginated,
  firstRow,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import { normalizePaymentMethod } from "~/enums/paymentMethod";
import { assignFeeAmount } from "~/utils/payment-fee";
import type {
  EligibleSalesQuery,
  ExchangePreviewPayload,
  ExchangeCreatePayload,
  ExchangeResponse,
  ExchangePreviewResponse,
  EligibleSaleResponse,
} from "../types/exchange.types";

export const exchangeApi = {
  /** GET /admin-api/exchanges/eligible-sales → PaginatedResponse<EligibleSaleResponse> */
  async getEligibleSales(
    params: EligibleSalesQuery = {},
  ): Promise<PaginatedResponse<EligibleSaleResponse>> {
    return asPaginated<EligibleSaleResponse>(
      await apiFetch("/admin-api/exchanges/eligible-sales", {
        method: "GET",
        params,
      }),
    );
  },

  /** POST /admin-api/exchanges/preview → ExchangePreviewResponse */
  async previewExchange(
    payload: ExchangePreviewPayload,
  ): Promise<ExchangePreviewResponse> {
    return asData<ExchangePreviewResponse>(
      await apiFetch("/admin-api/exchanges/preview", {
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

  /** POST /admin-api/exchanges → ExchangeResponse | null */
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
      assignFeeAmount(body, body.paymentMethod, payload.feeAmount);
    }

    if (payload.refundMethod) {
      body.refundMethod = normalizePaymentMethod(payload.refundMethod);
    }

    if (payload.proofReference) {
      body.proofReference = payload.proofReference;
    }

    return firstRow<ExchangeResponse>(
      await apiFetch("/admin-api/exchanges", {
        method: "POST",
        body,
      }),
    );
  },
};

/** @deprecated Prefer `exchangeApi` */
export const exchangeService = exchangeApi;
