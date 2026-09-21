import { formatMoney } from "~/utils/format";
import { getPaymentMethodLabel } from "~/utils/paymentMethods";
import {
  DEFAULT_METRIC_COLOR,
  STOCK_MOVEMENT_COLORS,
  getOperationStatusColor,
  getOperationStatusLabel,
  getStockMovementColor,
  getStudentSaleLabel,
  getTimelineEventLabel,
} from "~/utils/domainLabels";

export const STUDENT_OPS_METRIC_COLORS = {
  qty: STOCK_MOVEMENT_COLORS.STOCK_IN,
  price: STOCK_MOVEMENT_COLORS.SALE,
  paid: STOCK_MOVEMENT_COLORS.STOCK_IN,
  remaining: STOCK_MOVEMENT_COLORS.RETURN,
  remainingZero: DEFAULT_METRIC_COLOR,
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
    price: moneyLabel(product?.price ?? product?.sellingPrice),
    teacherName: product?.teacher?.name || product?.teacherName || null,
    studyYearName: product?.studyYear?.name || product?.studyYearName || null,
    priceColor: STOCK_MOVEMENT_COLORS.SALE,
  };
};

/** Map API student-operation rows into table display rows. */
export const mapStudentOperationRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => {
    const typeKey = String(row.type || "").toUpperCase();
    const statusKey = String(row.status || row.operationStatus || "").toUpperCase();
    const remainingRaw = Number(row.remainingAmount ?? 0);
    return {
      id: row.id,
      createdAt: row.date || row.createdAt || null,
      typeKey,
      typeLabel: getStudentSaleLabel(typeKey) || typeKey,
      typeColor: getStockMovementColor(typeKey),
      studentName: row.student?.name || "-",
      branchName: row.branch?.name || "-",
      productObj: toProductCell(row.product),
      totalAmount: moneyOrDash(row.totalAmount),
      paidAmount: moneyOrDash(row.paidAmount),
      remainingAmount: moneyOrDash(row.remainingAmount),
      remainingRaw: Number.isFinite(remainingRaw) ? remainingRaw : 0,
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
  pushUnique(product.teacher?.name || product.teacherName);
  pushUnique(product.studyYear?.name || product.studyYearName);

  return parts.join(" — ");
};

const pushLine = (lines, value) => {
  if (value == null || value === "") return;
  lines.push(value);
};

const detailsForCreated = (data) => {
  const lines = [];
  pushLine(lines, formatProductLine(data.product));
  if (data.quantity != null) pushLine(lines, `الكمية: ${data.quantity}`);
  if (data.total != null) pushLine(lines, `الإجمالي: ${moneyOrDash(data.total)}`);
  if (data.paid != null) pushLine(lines, `المدفوع: ${moneyOrDash(data.paid)}`);
  if (data.remaining != null) {
    pushLine(lines, `المتبقي: ${moneyOrDash(data.remaining)}`);
  }
  if (data.method) {
    pushLine(lines, `طريقة الدفع: ${getPaymentMethodLabel(data.method)}`);
  }
  return lines;
};

const detailsForPayment = (data) => {
  const lines = [];
  if (data.amount != null) pushLine(lines, moneyOrDash(data.amount));
  if (data.method) pushLine(lines, getPaymentMethodLabel(data.method));
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
  if (data.method) {
    pushLine(lines, `طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
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
  if (data.method) {
    pushLine(lines, `طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
  }
  return lines;
};

const detailsForRefund = (data) => {
  const lines = [];
  if (data.amount != null) {
    pushLine(lines, `المبلغ المسترد: ${moneyOrDash(data.amount)}`);
  }
  if (data.method) {
    pushLine(lines, `طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
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
  if (data.method) {
    pushLine(lines, `طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
  }
  return lines;
};

const detailsForDeliveredOrCompleted = (data) => {
  const lines = [];
  pushLine(lines, formatProductLine(data.product));
  if (data.quantity != null) pushLine(lines, `الكمية: ${data.quantity}`);
  if (data.paid != null) pushLine(lines, `المدفوع: ${moneyOrDash(data.paid)}`);
  if (data.method) {
    pushLine(lines, `طريقة الدفع: ${getPaymentMethodLabel(data.method)}`);
  }
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
    return {
      id: event.id,
      type,
      title: getTimelineEventLabel(type, source, event?.data || {}),
      date: event.date,
      actorName: event.actor?.name || null,
      details: buildTimelineEventDetails(event),
    };
  });
};
