import { formatMoney } from "~/utils/format/money";
import { isFiniteNumber } from "~/utils/format/number";
import { getPaymentMethodLabel } from "~/enums/paymentMethod";
import { DEFAULT_METRIC_COLOR } from "~/utils/domain-labels/shared";
import { STOCK_MOVEMENT_COLORS } from "~/utils/domain-labels/inventory";
import {
  getOperationActivityColor,
  getOperationActivityLabel,
  getOperationStatusColor,
  getOperationStatusLabel,
  getTimelineEventLabel,
} from "~/utils/domain-labels/student-operations";
import {
  normalizeOperationActivity,
  OperationActivity,
} from "~/enums/operationActivity";
import { normalizeOperationKind } from "~/enums/operationKind";
import { normalizeOperationStatus } from "~/enums/operationStatus";

/**
 * Student-ops / timeline mappers for branch + customer-service reports.
 * Nested-only: reads API nested shapes (student, product.teacher, product.studyYear).
 * BE student-ops rows send `status`, `createdAt` (+ `date`), and `product.price`.
 */

export const STUDENT_OPS_METRIC_COLORS = {
  qty: STOCK_MOVEMENT_COLORS.STOCK_IN,
  price: STOCK_MOVEMENT_COLORS.SALE,
  paid: STOCK_MOVEMENT_COLORS.STOCK_IN,
  remaining: STOCK_MOVEMENT_COLORS.RETURN,
  remainingZero: DEFAULT_METRIC_COLOR,
  /** Theme primary — highlight money collected today / at delivery. */
  activityPaid: "#f5af52",
};

export const STUDENT_OPS_COLUMNS = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "createdAt", header: "التاريخ", slot: "time" },
  { field: "typeLabel", header: "النوع", slot: "type" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "studentName", header: "الطالب" },
  { field: "product", header: "المنتج", slot: "product" },
  { field: "totalAmount", header: "الإجمالي", slot: "totalAmount" },
  { field: "paidAmount", header: "المدفوع", slot: "paidAmount" },
  { field: "remainingAmount", header: "المتبقي", slot: "remainingAmount" },
];

export const metricTagStyle = (color) => {
  const c = color || DEFAULT_METRIC_COLOR;
  return {
    color: c,
    backgroundColor: `${c}22`,
    border: `1px solid ${c}55`,
  };
};

const moneyLabel = (value) => {
  if (value == null || value === "") return null;
  return formatMoney(value, "locale");
};

const moneyOrDash = (value) => moneyLabel(value) || "-";

const toProductCell = (product) => {
  const name = product?.name || null;
  if (!name) return null;
  return {
    name,
    price: moneyLabel(product.price),
    teacherName: product.teacher?.name || null,
    studyYearName: product.studyYear?.name || null,
    priceColor: STOCK_MOVEMENT_COLORS.SALE,
  };
};

/** Map API student-operation rows into table display rows. */
export const mapStudentOperationRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => {
    const typeKey = normalizeOperationKind(row.type) || String(row.type || "").toUpperCase();
    // Prefer day-activity (DELIVERED vs RESERVATION) for the type badge.
    const activityKey =
      normalizeOperationActivity(row.activity) ||
      normalizeOperationActivity(row.type) ||
      typeKey;
    const statusKey =
      normalizeOperationStatus(row.status) ||
      String(row.status || "").toUpperCase();
    const remainingRaw = Number(row.remainingAmount ?? 0);
    const activityPaidRaw = Number(row.activityPaidAmount ?? 0);
    const showDeliveryPaidNote =
      activityKey === OperationActivity.DELIVERED &&
      isFiniteNumber(activityPaidRaw) &&
      activityPaidRaw > 0;
    return {
      id: row.id,
      // BE sends both createdAt and date (same value); prefer createdAt.
      createdAt: row.createdAt ?? row.date ?? null,
      typeKey,
      activityKey,
      typeLabel: getOperationActivityLabel(activityKey) || activityKey,
      typeColor: getOperationActivityColor(activityKey),
      studentName: row.student?.name || "-",
      branchName: row.branch?.name || "-",
      productObj: toProductCell(row.product),
      totalAmount: moneyOrDash(row.totalAmount),
      paidAmount: moneyOrDash(row.paidAmount),
      deliveryPaidNote: showDeliveryPaidNote
        ? moneyOrDash(activityPaidRaw)
        : null,
      remainingAmount: moneyOrDash(row.remainingAmount),
      remainingRaw: isFiniteNumber(remainingRaw) ? remainingRaw : 0,
      statusKey,
      statusLabel: getOperationStatusLabel(statusKey) || "—",
      statusColor: getOperationStatusColor(statusKey),
    };
  });

const formatProductLine = (product) => {
  if (!product?.name) return null;

  const parts = [];
  const pushUnique = (value) => {
    const text = String(value || "").trim();
    if (!text) return;
    if (parts.some((part) => part === text || part.includes(text))) return;
    parts.push(text);
  };

  pushUnique(product.name);
  pushUnique(product.teacher?.name);
  pushUnique(product.studyYear?.name);
  pushUnique(moneyLabel(product.price));

  return parts.join(" — ");
};

const pushLine = (lines, value) => {
  if (value == null || value === "") return;
  lines.push(value);
};

const productUnitPrice = (product) => {
  const n = Number(product?.price);
  return isFiniteNumber(n) && n > 0 ? n : null;
};

/**
 * When API quantity conflicts with total/paid ÷ unit price, prefer the derived qty
 * (e.g. qty 1 + unit 500 + total 1000 → show qty 2).
 */
const reconcileQuantity = (rawQty, unitPrice, moneyAmount) => {
  const qty = Number(rawQty);
  const money = Number(moneyAmount);
  if (!isFiniteNumber(qty) || rawQty == null) return rawQty;
  if (unitPrice == null || !isFiniteNumber(money)) return qty;

  const expected = unitPrice * qty;
  if (Math.abs(expected - money) < 0.02) return qty;

  const derived = Math.round(money / unitPrice);
  if (derived > 0 && Math.abs(derived * unitPrice - money) < 0.02) {
    return derived;
  }
  return qty;
};

const detailsForCreated = (data) => {
  const lines = [];
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length) {
    for (const item of items) {
      const productLine = formatProductLine(item.product);
      if (productLine) pushLine(lines, productLine);
      const unit = productUnitPrice(item.product);
      const qty = reconcileQuantity(
        item.quantity ?? data.quantity,
        unit,
        item.total ?? item.amount ?? data.total,
      );
      if (qty != null) pushLine(lines, `الكمية: ${qty}`);
      if (item.total != null || item.amount != null) {
        pushLine(lines, `الإجمالي: ${moneyOrDash(item.total ?? item.amount)}`);
      }
    }
    if (data.total != null && items.length > 1) {
      pushLine(lines, `الإجمالي: ${moneyOrDash(data.total)}`);
    }
  } else {
    pushLine(lines, formatProductLine(data.product));
    const unit = productUnitPrice(data.product);
    const qty = reconcileQuantity(data.quantity, unit, data.total ?? data.paid);
    if (qty != null) pushLine(lines, `الكمية: ${qty}`);
    if (data.total != null) pushLine(lines, `الإجمالي: ${moneyOrDash(data.total)}`);
  }

  if (data.paid != null) pushLine(lines, `المدفوع: ${moneyOrDash(data.paid)}`);
  if (data.remaining != null) {
    pushLine(lines, `المتبقي: ${moneyOrDash(data.remaining)}`);
  }
  return lines;
};

const detailsForPayment = (data) => {
  const lines = [];
  if (data.amount != null) pushLine(lines, moneyOrDash(data.amount));
  return lines;
};

const detailsForExchange = (data) => {
  const lines = [];
  const oldLine = formatProductLine(data.oldProduct);
  const newLine = formatProductLine(data.newProduct);
  if (oldLine) pushLine(lines, `المنتج السابق: ${oldLine}`);
  if (newLine) pushLine(lines, `المنتج الجديد: ${newLine}`);
  if (data.quantity != null) pushLine(lines, `الكمية: ${data.quantity}`);
  if (data.differenceAmount != null) {
    pushLine(lines, `فرق السعر: ${moneyOrDash(data.differenceAmount)}`);
  }
  if (data.refundAmount != null) {
    pushLine(lines, `المبلغ المسترد: ${moneyOrDash(data.refundAmount)}`);
  }
  return lines;
};

const detailsForCancelled = (data) => {
  const lines = [];
  if (data.reason) pushLine(lines, `السبب: ${data.reason}`);
  if (data.refundAmount != null || data.amount != null) {
    pushLine(
      lines,
      `المبلغ المسترد: ${moneyOrDash(data.refundAmount ?? data.amount)}`,
    );
  }
  return lines;
};

const detailsForRefund = (data) => {
  const lines = [];
  if (data.amount != null) {
    pushLine(lines, `المبلغ المسترد: ${moneyOrDash(data.amount)}`);
  }
  return lines;
};

const detailsForReturn = (data) => {
  const lines = [];
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length) {
    for (const item of items) {
      const productLine = formatProductLine(item.product);
      if (productLine) pushLine(lines, `المنتج: ${productLine}`);
      if (item.quantity != null) pushLine(lines, `الكمية: ${item.quantity}`);
      if (item.refundAmount != null) {
        pushLine(lines, `مبلغ الصنف: ${moneyOrDash(item.refundAmount)}`);
      }
    }
  } else {
    const productLine = formatProductLine(data.product);
    if (productLine) pushLine(lines, `المنتج: ${productLine}`);
    if (data.quantity != null) pushLine(lines, `الكمية: ${data.quantity}`);
  }

  if (data.amount != null) {
    pushLine(lines, `مبلغ المرتجع: ${moneyOrDash(data.amount)}`);
  }
  return lines;
};

const detailsForDeliveredOrCompleted = (data) => {
  const lines = [];
  pushLine(lines, formatProductLine(data.product));
  const unit = productUnitPrice(data.product);
  const qty = reconcileQuantity(data.quantity, unit, data.paid ?? data.total);
  if (qty != null) pushLine(lines, `الكمية: ${qty}`);
  if (data.paid != null) pushLine(lines, `المدفوع: ${moneyOrDash(data.paid)}`);
  return lines;
};

const EVENT_DETAIL_BUILDERS = {
  CREATED: detailsForCreated,
  PAYMENT: detailsForPayment,
  EXCHANGE: detailsForExchange,
  CANCELLED: detailsForCancelled,
  REFUND: detailsForRefund,
  RETURN: detailsForReturn,
  DELIVERED: detailsForDeliveredOrCompleted,
  COMPLETED: detailsForDeliveredOrCompleted,
};

/** Build human-readable detail lines for one timeline event. */
export const buildTimelineEventDetails = (event) => {
  const type = String(event?.type || "").toUpperCase();
  const data = event?.data || {};
  const builder = EVENT_DETAIL_BUILDERS[type];
  return builder ? builder(data) : [];
};

/** Map timeline API payload into panel event items. */
export const mapTimelineEvents = (payload) => {
  const events = payload?.timeline;
  const operationType = payload?.operation?.type || null;
  if (!Array.isArray(events)) return [];

  return events.map((event) => {
    const type = String(event.type || "").toUpperCase();
    const source =
      String(event?.data?.source || "").toUpperCase() || operationType;
    const data = event?.data || {};
    const payment = data.payment || null;
    const image = payment?.image || null;
    const method = data.method || null;
    return {
      id: event.id,
      type,
      title: getTimelineEventLabel(type, source, data),
      date: event.date,
      actorName: event.actor?.name || null,
      details: buildTimelineEventDetails(event),
      method,
      methodLabel:
        payment?.methodLabel || getPaymentMethodLabel(method, null) || null,
      payment: payment
        ? {
            id: payment.id ?? null,
            method: payment.method || null,
            methodLabel: payment.methodLabel || null,
            image: image
              ? {
                  reference: image.reference ?? null,
                  url: image.url ?? null,
                  hasProof: Boolean(image.hasProof),
                }
              : null,
          }
        : null,
    };
  });
};
