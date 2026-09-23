import { apiFetch, firstRow, asList, asData } from "~/utils/apiFetch";
import type {
  SaleQuery,
  SalePayload,
  SaleResponse,
  SaleTimelineResponse,
} from "../types/sale.types";

export const saleApi = {
  /** GET /sales → SaleResponse[] */
  async getSales(params: SaleQuery = {}): Promise<SaleResponse[]> {
    return asList<SaleResponse>(
      await apiFetch("/sales", { method: "GET", params }),
    );
  },

  /** GET /sales/:id → SaleResponse | null */
  async getSale(id: string): Promise<SaleResponse | null> {
    return firstRow<SaleResponse>(
      await apiFetch(`/sales/${id}`, { method: "GET" }),
    );
  },

  /** POST /sales → SaleResponse | null */
  async createSale(payload: SalePayload): Promise<SaleResponse | null> {
    return firstRow<SaleResponse>(
      await apiFetch("/sales", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** GET /sales/:id/timeline → SaleTimelineResponse */
  async getTimeline(id: string): Promise<SaleTimelineResponse> {
    return asData<SaleTimelineResponse>(
      await apiFetch(`/sales/${id}/timeline`, { method: "GET" }),
    );
  },
};

/** @deprecated Prefer `saleApi` */
export const saleService = saleApi;
