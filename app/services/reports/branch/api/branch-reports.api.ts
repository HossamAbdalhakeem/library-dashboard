import { apiFetch, asData } from "~/utils/apiFetch";
import {
  withDefaultRange,
  unwrapReportPayload,
} from "~/services/reports/shared";
import type { BranchReportSection } from "~/services/reports/shared";
import type {
  BranchReportQuery,
  BranchDailySummaryResponse,
  BranchSectionResponse,
  BranchOperationTimeline,
} from "../types/branch-reports.types";

const BRANCH_SECTION_PATH: Record<BranchReportSection, string> = {
  sales: "sales",
  reservations: "reservations",
  delivered: "delivered",
  cancelled: "cancelled",
  received: "received",
  stockOut: "stock-out",
  allMovements: "all-movements",
  stockOperations: "stock-operations",
  studentOperations: "student-operations",
  returns: "returns",
  exchanges: "exchanges",
  refunds: "refunds",
};

export const branchReportsApi = {
  async getSummary(
    params: BranchReportQuery = {},
  ): Promise<BranchDailySummaryResponse> {
    return asData(
      await apiFetch("/reports/branch/summary", {
        method: "GET",
        params: withDefaultRange(params),
      }),
    );
  },

  async getSection(
    section: BranchReportSection,
    params: BranchReportQuery = {},
  ): Promise<BranchSectionResponse> {
    const path = BRANCH_SECTION_PATH[section];
    if (!path) {
      throw new Error(`Unsupported branch report section: ${section}`);
    }
    const response = await apiFetch(`/reports/branch/${path}`, {
      method: "GET",
      params: withDefaultRange(params),
    });
    return unwrapReportPayload(response);
  },

  async getOperationTimeline(
    operationId: string,
  ): Promise<BranchOperationTimeline> {
    return asData(
      await apiFetch(
        `/reports/branch/student-operations/${encodeURIComponent(operationId)}/timeline`,
        { method: "GET" },
      ),
    );
  },
};
