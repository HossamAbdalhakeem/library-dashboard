import { apiFetch, apiFetchBlob, firstRow, asData } from "~/utils/apiFetch";
import type {
  SaleExportQuery,
  SalePayload,
  SaleResponse,
  SaleTimelineResponse,
} from "../types/sale.types";

export const saleApi = {
  /** POST /admin-api/sales → SaleResponse | null */
  async createSale(payload: SalePayload): Promise<SaleResponse | null> {
    return firstRow<SaleResponse>(
      await apiFetch("/admin-api/sales", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** GET /admin-api/sales/:id/timeline → SaleTimelineResponse */
  async getTimeline(id: string): Promise<SaleTimelineResponse> {
    return asData<SaleTimelineResponse>(
      await apiFetch(`/admin-api/sales/${id}/timeline`, { method: "GET" }),
    );
  },

  /** GET /admin-api/sales/export → Excel blob (admin only) */
  async exportSales(params: SaleExportQuery = {}): Promise<Blob> {
    return apiFetchBlob("/admin-api/sales/export", {
      method: "GET",
      params,
    });
  },
};

/** @deprecated Prefer `saleApi` */
export const saleService = saleApi;
