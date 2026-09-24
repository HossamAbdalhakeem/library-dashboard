import { apiFetch, firstRow } from "~/utils/apiFetch";
import type {
  ReturnPayload,
  ReturnResponse,
} from "../types/return.types";

export const returnApi = {
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
