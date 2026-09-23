import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  ReturnQuery,
  ReturnPayload,
  ReturnResponse,
} from "../types/return.types";

export const returnApi = {
  /** GET /returns → ReturnResponse[] */
  async getReturns(params: ReturnQuery = {}): Promise<ReturnResponse[]> {
    return asList<ReturnResponse>(
      await apiFetch("/returns", { method: "GET", params }),
    );
  },

  /** GET /returns/:id → ReturnResponse | null */
  async getReturn(id: string): Promise<ReturnResponse | null> {
    return firstRow<ReturnResponse>(
      await apiFetch(`/returns/${id}`, { method: "GET" }),
    );
  },

  /** POST /returns → ReturnResponse | null */
  async createReturn(payload: ReturnPayload): Promise<ReturnResponse | null> {
    return firstRow<ReturnResponse>(
      await apiFetch("/returns", {
        method: "POST",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `returnApi` */
export const returnService = returnApi;
