/** Shared domain labels for API enum keys (Arabic UI). */

import { getStatusTagSeverity } from "~/utils/statusTags";

export const RESERVATION_STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  WAITING_FOR_STOCK: "بانتظار المخزون",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export const SALE_STATUS_LABELS = {
  COMPLETED: "مكتمل",
  PARTIALLY_RETURNED: "مسترد جزئيًا",
  RETURNED: "تم الاسترداد",
  EXCHANGED: "مستبدل",
  PARTIALLY_EXCHANGED: "مستبدل جزئيًا",
};

export const STOCK_MOVEMENT_LABELS = {
  STOCK_IN: "استلام",
  STOCK_OUT: "سحب",
  SALE: "بيع",
  RESERVATION: "حجز",
  RESERVATION_RELEASE: "إلغاء حجز",
  RETURN: "مرتجع",
  DAMAGED: "تالف",
  ADJUSTMENT: "تسوية",
  EXCHANGE: "استبدال",
  REFUND: "استرداد",
};

/** Warehouse stock operation types (add / remove). */
export const STOCK_OPERATION_LABELS = {
  STOCK_IN: "إضافة للمخزن",
  STOCK_OUT: "سحب من المخزن",
};

/** Sales and reservations in سجل العمليات. */
export const STUDENT_SALE_LABELS = {
  SALE: "بيع",
  RESERVATION: "حجز",
};

/** Derived lifecycle status for سجل العمليات */
export const OPERATION_STATUS_LABELS = {
  ACTIVE: "نشط",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  EXCHANGED: "مستبدل",
  PARTIALLY_REFUNDED: "مسترد جزئياً",
  FULLY_REFUNDED: "مسترد بالكامل",
};

export const OPERATION_STATUS_COLORS = {
  ACTIVE: "#10b981",
  COMPLETED: "#38bdf8",
  CANCELLED: "#fb7185",
  EXCHANGED: "#8b5cf6",
  PARTIALLY_REFUNDED: "#f97316",
  FULLY_REFUNDED: "#e11d48",
};

/** Timeline event titles (backend sends English type codes only). */
export const TIMELINE_EVENT_LABELS = {
  CREATED: "إنشاء العملية",
  CREATED_SALE: "إنشاء البيع",
  CREATED_RESERVATION: "إنشاء الحجز",
  PAYMENT: "دفعة",
  PAYMENT_SALE: "استلام الدفع",
  PAYMENT_RESERVATION: "دفعة",
  DELIVERED: "تسليم المنتج",
  DELIVERED_WITH_PAYMENT: "تحصيل المتبقي وتسليم المنتج",
  CANCELLED: "إلغاء الحجز",
  CANCELLED_WITH_REFUND: "إلغاء الحجز مع استرداد المبلغ",
  REFUND: "استرداد المبلغ للطالب",
  EXCHANGE: "استبدال المنتج",
  EXCHANGE_COLLECT: "استبدال مع تحصيل فرق السعر",
  EXCHANGE_REFUND: "استبدال مع رد فرق السعر",
  RETURN: "مرتجع منتج",
  RETURN_WITH_REFUND: "مرتجع منتج مع استرداد المبلغ",
  COMPLETED: "اكتمال العملية",
  COMPLETED_SALE: "تم الدفع والاستلام",
};

/** Distinct accent colors for stock-movement type chips in tables. */
export const STOCK_MOVEMENT_COLORS = {
  STOCK_IN: "#10b981",
  STOCK_OUT: "#f97316",
  SALE: "#f5af52",
  RESERVATION: "#a78bfa",
  RESERVATION_RELEASE: "#fb7185",
  RETURN: "#e11d48",
  DAMAGED: "#b91c1c",
  ADJUSTMENT: "#94a3b8",
  EXCHANGE: "#6366f1",
  REFUND: "#f43f5e",
};



export const TRANSACTION_TYPE_LABELS = {
  SALE: "بيع",
  RESERVATION: "حجز",
  RETURN: "مرتجع",
  EXCHANGE: "استبدال",
};

export const EXCHANGE_DIFF_META = {
  more: {
    title: "الطالب سيدفع فرق سعر إضافي",
    diffLabel: "المبلغ المطلوب تحصيله",
    confirmText: (amount) =>
      `سيتم تحصيل فرق سعر قدره ${Number(amount || 0).toFixed(2)} من الطالب.`,
  },
  less: {
    title: "سيتم رد فرق السعر للطالب",
    diffLabel: "المبلغ الذي سيُرد للطالب",
    confirmText: (amount) =>
      `سيتم رد فرق سعر قدره ${Number(amount || 0).toFixed(2)} للطالب.`,
  },
  same: {
    title: "نفس السعر — لا يوجد فرق مالي",
    diffLabel: "فرق السعر",
    confirmText: () => "السعر متساوٍ ولن يتم تحصيل أو رد أي مبلغ.",
  },
};

export const AVAILABILITY_LABELS = {
  AVAILABLE: "متاح",
  UNAVAILABLE: "غير متاح",
};

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

export const DEFAULT_METRIC_COLOR = "#94a3b8";

export const UNSPECIFIED_LABEL = "غير محدد";

export const getLabel = (map, key, fallback = key || "—") => {
  if (key == null || key === "") return fallback;
  const normalized = String(key);
  return map[normalized] || map[normalized.toUpperCase()] || fallback;
};

export const getReservationStatusLabel = (status) =>
  getLabel(RESERVATION_STATUS_LABELS, status);

export const getSaleStatusLabel = (status) =>
  getLabel(SALE_STATUS_LABELS, status);

export const getSaleStatusSeverity = (status) =>
  getStatusTagSeverity("sale", status);

export const getStockMovementLabel = (type) =>
  getLabel(STOCK_MOVEMENT_LABELS, String(type || "").toUpperCase());

export const getStockOperationLabel = (type) =>
  getLabel(STOCK_OPERATION_LABELS, String(type || "").toUpperCase());

export const getStockMovementColor = (type) =>
  STOCK_MOVEMENT_COLORS[String(type || "").toUpperCase()] || DEFAULT_METRIC_COLOR;

export const getOperationStatusLabel = (status) =>
  getLabel(OPERATION_STATUS_LABELS, String(status || "").toUpperCase());

export const getOperationStatusColor = (status) =>
  OPERATION_STATUS_COLORS[String(status || "").toUpperCase()] ||
  DEFAULT_METRIC_COLOR;

export const getStudentSaleLabel = (type) =>
  getLabel(STUDENT_SALE_LABELS, String(type || "").toUpperCase());

export const getTimelineEventLabel = (eventType, operationType, data = {}) => {
  const type = String(eventType || "").toUpperCase();
  const op = String(operationType || "").toUpperCase();
  if (type === "CREATED" || type === "PAYMENT" || type === "COMPLETED") {
    const scoped = TIMELINE_EVENT_LABELS[`${type}_${op}`];
    if (scoped) return scoped;
  }

  if (type === "RETURN") {
    const amount = Number(data.amount);
    if ((Number.isFinite(amount) && amount > 0) || data.method) {
      return TIMELINE_EVENT_LABELS.RETURN_WITH_REFUND;
    }
    return TIMELINE_EVENT_LABELS.RETURN;
  }

  if (type === "EXCHANGE") {
    const diff = Number(data.differenceAmount);
    const refundAmount = Number(data.refundAmount);
    if ((Number.isFinite(refundAmount) && refundAmount > 0) || diff < 0) {
      return TIMELINE_EVENT_LABELS.EXCHANGE_REFUND;
    }
    if (Number.isFinite(diff) && diff > 0) {
      return TIMELINE_EVENT_LABELS.EXCHANGE_COLLECT;
    }
    return TIMELINE_EVENT_LABELS.EXCHANGE;
  }

  if (type === "DELIVERED") {
    const paid = Number(data.paid);
    if ((Number.isFinite(paid) && paid > 0) || data.method) {
      return TIMELINE_EVENT_LABELS.DELIVERED_WITH_PAYMENT;
    }
    return TIMELINE_EVENT_LABELS.DELIVERED;
  }

  if (type === "CANCELLED") {
    const amount = Number(data.refundAmount ?? data.amount);
    if ((Number.isFinite(amount) && amount > 0) || data.method) {
      return TIMELINE_EVENT_LABELS.CANCELLED_WITH_REFUND;
    }
    return TIMELINE_EVENT_LABELS.CANCELLED;
  }

  return getLabel(TIMELINE_EVENT_LABELS, type);
};


export const getTransactionTypeLabel = (type) =>
  getLabel(TRANSACTION_TYPE_LABELS, String(type || "").toUpperCase());

export const getReportMetricColor = (key) =>
  REPORT_METRIC_COLORS[key] || DEFAULT_METRIC_COLOR;

export const getAvailabilityLabel = (value) => {
  if (value === true || value === "AVAILABLE" || value === "available") {
    return AVAILABILITY_LABELS.AVAILABLE;
  }
  if (value === false || value === "UNAVAILABLE" || value === "unavailable") {
    return AVAILABILITY_LABELS.UNAVAILABLE;
  }
  return getLabel(AVAILABILITY_LABELS, value, String(value || "—"));
};

export const buildExchangeDiffLabels = (comparison) => {
  const kind = comparison?.kind || "same";
  const meta = EXCHANGE_DIFF_META[kind] || EXCHANGE_DIFF_META.same;
  const amount = comparison?.absoluteDifference ?? Math.abs(comparison?.difference || 0);
  return {
    title: meta.title,
    diffLabel: meta.diffLabel,
    confirmText: meta.confirmText(amount),
  };
};

export const formatLowStockNotification = (item) => {
  const product = item?.productName || "منتج";
  const branch = item?.branchName || "—";
  const available = item?.availableQuantity ?? 0;
  const threshold = item?.threshold ?? 0;
  return {
    title: "تنبيه نقص مخزون",
    message: `${product} في فرع ${branch} — المتاح ${available} (حد التنبيه ${threshold})`,
  };
};
