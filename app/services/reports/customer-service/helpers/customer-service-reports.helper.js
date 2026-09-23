/**
 * Customer-service report READ helpers.
 * Student-ops / timeline shapes match branch — reuse shared nested-only mappers.
 */

export {
  STUDENT_OPS_METRIC_COLORS,
  STUDENT_OPS_COLUMNS,
  metricTagStyle,
  mapStudentOperationRows,
  buildTimelineEventDetails,
  mapTimelineEvents,
} from "~/services/reports/shared/student-operations.helper";

/** Normalize CS daily summary payload for hero + payment methods UI. */
export const normalizeCustomerServiceSummary = (payload = {}) => {
  const summary = payload?.summary || payload || {};
  return {
    paymentsCollected: Number(summary.paymentsCollected || 0),
    paymentsTotal: Number(summary.paymentsTotal || 0),
    refundsTotal: Number(summary.refundsTotal || 0),
    paymentsByMethod: Array.isArray(summary.paymentsByMethod)
      ? summary.paymentsByMethod
      : [],
  };
};
