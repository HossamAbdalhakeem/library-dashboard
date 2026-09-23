import { asData } from "~/utils/apiFetch";

/**
 * Unwrap report API payloads.
 * Paginated sections use top-level `{ data, pagination }` — do not strip those
 * with asData() or list/pagination are lost.
 */
export const unwrapReportPayload = (response) => {
  if (
    response &&
    typeof response === "object" &&
    "pagination" in response &&
    Array.isArray(response.data)
  ) {
    return response;
  }
  if (
    response?.data &&
    typeof response.data === "object" &&
    "pagination" in response.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data;
  }
  return asData(response);
};
