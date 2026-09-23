import { DEFAULT_METRIC_COLOR, getLabel } from "./shared";
import { isFiniteNumber } from "~/utils/format/number";
import { OperationActivity } from "~/enums/operationActivity";
import { OperationKind } from "~/enums/operationKind";
import { OperationStatus } from "~/enums/operationStatus";

/** Table "النوع" badge — prefer `activity` over entity `type`. */
export const OPERATION_ACTIVITY_LABELS = {
  [OperationActivity.SALE]: "بيع",
  [OperationActivity.RESERVATION]: "حجز",
  [OperationActivity.DELIVERED]: "تسليم حجز",
};

export const OPERATION_ACTIVITY_COLORS = {
  [OperationActivity.SALE]: "#f5af52",
  [OperationActivity.RESERVATION]: "#a78bfa",
  [OperationActivity.DELIVERED]: "#10b981",
};

/** @deprecated Prefer OPERATION_ACTIVITY_LABELS (entity kind only). */
export const STUDENT_SALE_LABELS = {
  [OperationKind.SALE]: "بيع",
  [OperationKind.RESERVATION]: "حجز",
};

/** Derived lifecycle status for سجل العمليات */
export const OPERATION_STATUS_LABELS = {
  [OperationStatus.ACTIVE]: "نشط",
  [OperationStatus.COMPLETED]: "مكتمل",
  [OperationStatus.CANCELLED]: "ملغي",
  [OperationStatus.EXCHANGED]: "مستبدل",
  [OperationStatus.PARTIALLY_REFUNDED]: "مسترد جزئياً",
  [OperationStatus.FULLY_REFUNDED]: "مسترد بالكامل",
};

export const OPERATION_STATUS_COLORS = {
  [OperationStatus.ACTIVE]: "#10b981",
  [OperationStatus.COMPLETED]: "#38bdf8",
  [OperationStatus.CANCELLED]: "#fb7185",
  [OperationStatus.EXCHANGED]: "#8b5cf6",
  [OperationStatus.PARTIALLY_REFUNDED]: "#f97316",
  [OperationStatus.FULLY_REFUNDED]: "#e11d48",
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

export const getOperationStatusLabel = (status) =>
  getLabel(OPERATION_STATUS_LABELS, String(status || "").toUpperCase());

export const getOperationStatusColor = (status) =>
  OPERATION_STATUS_COLORS[String(status || "").toUpperCase()] ||
  DEFAULT_METRIC_COLOR;

export const getOperationActivityLabel = (activity) =>
  getLabel(OPERATION_ACTIVITY_LABELS, String(activity || "").toUpperCase());

export const getOperationActivityColor = (activity) =>
  OPERATION_ACTIVITY_COLORS[String(activity || "").toUpperCase()] ||
  DEFAULT_METRIC_COLOR;

/** @deprecated Prefer getOperationActivityLabel. */
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
    if ((isFiniteNumber(amount) && amount > 0) || data.method) {
      return TIMELINE_EVENT_LABELS.RETURN_WITH_REFUND;
    }
    return TIMELINE_EVENT_LABELS.RETURN;
  }

  if (type === "EXCHANGE") {
    const diff = Number(data.differenceAmount);
    const refundAmount = Number(data.refundAmount);
    const dataSource = String(data.source || "").toUpperCase();
    // Reservation product change: extra is collected at delivery, not at exchange.
    const isReservation =
      op === OperationKind.RESERVATION || dataSource === "RESERVATION";

    if ((isFiniteNumber(refundAmount) && refundAmount > 0) || diff < 0) {
      return TIMELINE_EVENT_LABELS.EXCHANGE_REFUND;
    }
    if (isReservation) {
      return TIMELINE_EVENT_LABELS.EXCHANGE;
    }
    if (isFiniteNumber(diff) && diff > 0) {
      return TIMELINE_EVENT_LABELS.EXCHANGE_COLLECT;
    }
    return TIMELINE_EVENT_LABELS.EXCHANGE;
  }

  if (type === "DELIVERED") {
    const paid = Number(data.paid);
    if ((isFiniteNumber(paid) && paid > 0) || data.method) {
      return TIMELINE_EVENT_LABELS.DELIVERED_WITH_PAYMENT;
    }
    return TIMELINE_EVENT_LABELS.DELIVERED;
  }

  if (type === "CANCELLED") {
    const amount = Number(data.refundAmount ?? data.amount);
    if ((isFiniteNumber(amount) && amount > 0) || data.method) {
      return TIMELINE_EVENT_LABELS.CANCELLED_WITH_REFUND;
    }
    return TIMELINE_EVENT_LABELS.CANCELLED;
  }

  return getLabel(TIMELINE_EVENT_LABELS, type);
};
