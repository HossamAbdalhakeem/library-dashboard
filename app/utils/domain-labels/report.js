import { DEFAULT_METRIC_COLOR } from "./shared";

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
