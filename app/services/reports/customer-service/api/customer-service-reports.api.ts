import { apiFetch, asData } from "~/utils/apiFetch";
import {
  withDefaultRange,
  unwrapReportPayload,
} from "~/services/reports/shared";
import type { CustomerServiceReportSection } from "~/services/reports/shared";
import type {
  CustomerServiceReportQuery,
  CustomerServiceDailySummaryResponse,
  CustomerServiceSectionResponse,
  CustomerServiceOperationTimeline,
} from "../types/customer-service-reports.types";

const CUSTOMER_SERVICE_SECTION_PATH: Record<
  CustomerServiceReportSection,
  string
> = {
  reservations: "reservations",
  delivered: "delivered",
  cancelled: "cancelled",
  studentOperations: "student-operations",
};

export const customerServiceReportsApi = {
  async getSummary(
    params: CustomerServiceReportQuery = {},
  ): Promise<CustomerServiceDailySummaryResponse> {
    return asData(
      await apiFetch("/reports/customer-service/summary", {
        method: "GET",
        params: withDefaultRange(params),
      }),
    );
  },

  async getSection(
    section: CustomerServiceReportSection,
    params: CustomerServiceReportQuery = {},
  ): Promise<CustomerServiceSectionResponse> {
    const path = CUSTOMER_SERVICE_SECTION_PATH[section];
    if (!path) {
      throw new Error(`Unsupported customer-service report section: ${section}`);
    }
    const response = await apiFetch(`/reports/customer-service/${path}`, {
      method: "GET",
      params: withDefaultRange(params),
    });
    return unwrapReportPayload(response);
  },

  async getOperationTimeline(
    operationId: string,
  ): Promise<CustomerServiceOperationTimeline> {
    return asData(
      await apiFetch(
        `/reports/customer-service/student-operations/${encodeURIComponent(operationId)}/timeline`,
        { method: "GET" },
      ),
    );
  },
};
