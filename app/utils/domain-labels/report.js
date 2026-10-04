import { DEFAULT_METRIC_COLOR, getLabel } from "./shared";

export const REPORT_ACTIVITY_KEY_LABELS = {
  sales: "المبيعات",
  delivered: "حجوزات مسلّمة",
  undelivered: "حجوزات لم تستلم",
  cancelled: "حجوزات ملغاة",
  stockMovements: "حركات مخزن",
  ready: "جاهزة",
  waiting: "بانتظار المخزون",
  received: "وارد",
  stockOut: "سحب",
  returns: "مرتجعات",
  exchanges: "استبدالات",
  refunds: "عمليات الاسترداد",
  reservations: "الحجوزات",
  allMovements: "حركات المخزن",
};

/** Chart / legend colors by report metric key (frontend only). */
export const REPORT_METRIC_COLORS = {
  sales: "#f5af52",
  delivered: "#10b981",
  undelivered: "#f5af52",
  cancelled: "#e11d48",
  received: "#14b8a6",
  stockOut: "#ea580c",
  allMovements: "#8b5cf6",
  movements: "#8b5cf6",
  stockMovements: "#8b5cf6",
  returns: "#d946ef",
  exchanges: "#6366f1",
  refunds: "#f43f5e",
  reservations: "#f5af52",
  ready: "#10b981",
  waiting: "#06b6d4",
  branches: "#64748b",
};

export const getReportMetricColor = (key) =>
  REPORT_METRIC_COLORS[key] || DEFAULT_METRIC_COLOR;

/** Refund-events row kind. Exchange copy depends on settlement. */
export const REFUND_EVENT_KIND_LABELS = {
  RETURN: "مرتجع بيع",
  RESERVATION_CANCEL: "إلغاء حجز",
  SALE_REFUND: "استرداد بيع",
};

export const REFUND_EVENT_SETTLEMENT_LABELS = {
  REFUND: "استبدال (رد فرق)",
  COLLECT: "استبدال (تحصيل فرق)",
  EVEN: "استبدال",
  DEFERRED_TO_DELIVERY: "استبدال",
};

/** Shown under a deferred reservation exchange. The badge itself stays "استبدال". */
export const REFUND_EVENT_DEFERRED_HINT = "يُحصَّل عند التسليم";

export const getRefundEventKindLabel = (kind, settlement) => {
  const normalizedKind = String(kind || "").toUpperCase();
  if (normalizedKind === "EXCHANGE") {
    const normalizedSettlement = String(settlement || "").toUpperCase();
    return (
      REFUND_EVENT_SETTLEMENT_LABELS[normalizedSettlement] ||
      REFUND_EVENT_SETTLEMENT_LABELS.REFUND
    );
  }
  return getLabel(
    REFUND_EVENT_KIND_LABELS,
    normalizedKind,
    REFUND_EVENT_KIND_LABELS.SALE_REFUND,
  );
};
