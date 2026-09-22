import { formatMoney, formatDateTime } from "~/utils/format";
import { getPaymentMethodLabel } from "~/utils/paymentMethods";
import { getSaleStatusLabel } from "~/utils/domainLabels";

/**
 * GET /exchanges/eligible-sales — backend response shape (nested only):
 *
 * {
 *   id, saleNumber, branchId, createdAt, status, canModify,
 *   type, // SALE | RESERVATION
 *   totalAmount, paidAmount,
 *   quantitySummary: { label, totalSold, kind },
 *   student: { name, phone },
 *   branch: { name },
 *   payment: {
 *     id, method, methodLabel?,
 *     image: { reference, url, hasProof }
 *   },
 *   items: [{
 *     saleItemId, originalSaleItemId?, lineStatus?, canModify,
 *     product: {
 *       id, name, unitPrice, amount?, refundAmount?,
 *       teacher: { name }
 *     },
 *     quantity: { sold, returned, remaining },
 *     exchange?: {
 *       quantity, replacementSaleItemId,
 *       newProduct: { id, name, teacher: { name } }
 *     }
 *   }]
 * }
 */

const SALE_ORIGIN_LABELS = {
  SALE: "بيع مباشر",
  RESERVATION: "من حجز",
};

const toMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

const toQty = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const normalizeTeacher = (teacher) => {
  if (!teacher?.name) return null;
  return { name: teacher.name };
};

const normalizeProduct = (product = {}) => {
  const unitPrice = toMoney(product.unitPrice);
  const amount = toMoney(product.amount);
  const refundAmount = toMoney(
    product.refundAmount != null ? product.refundAmount : product.amount,
  );
  const teacher = normalizeTeacher(product.teacher);

  return {
    id: product.id || null,
    name: product.name || "-",
    teacher,
    unitPrice,
    amount,
    refundAmount,
    unitPriceLabel: formatMoney(unitPrice),
    amountLabel: formatMoney(amount),
    refundAmountLabel: formatMoney(refundAmount),
  };
};

/** Single clear quantity — no opaque formulas like "2 = 1 + 2". */
const buildQuantitySummary = (quantitySummary = {}, items = []) => {
  const totalSold =
    toQty(quantitySummary.totalSold) ||
    items.reduce((sum, item) => sum + toQty(item.quantity?.sold), 0);

  const totalRemaining = items.reduce(
    (sum, item) => sum + toQty(item.quantity?.remaining),
    0,
  );

  return {
    label: String(totalSold || totalRemaining || 0),
    totalSold,
    totalRemaining,
    kind: "simple",
  };
};

export const normalizeEligibleSaleItem = (item = {}) => {
  const quantity = item.quantity || {};
  const product = normalizeProduct(item.product);
  const exchange = item.exchange || null;

  const sold = toQty(quantity.sold);
  const returned = toQty(quantity.returned);
  const remaining = toQty(quantity.remaining);

  // If amount was omitted, derive from unit price × remaining.
  if (!item.product?.amount && product.unitPrice > 0 && remaining > 0) {
    product.amount = toMoney(product.unitPrice * remaining);
    product.amountLabel = formatMoney(product.amount);
    if (item.product?.refundAmount == null) {
      product.refundAmount = product.amount;
      product.refundAmountLabel = product.amountLabel;
    }
  }

  const normalizedExchange = exchange
    ? {
        quantity: toQty(exchange.quantity),
        replacementSaleItemId: exchange.replacementSaleItemId || null,
        newProduct: normalizeProduct(exchange.newProduct),
      }
    : null;

  return {
    saleItemId: item.saleItemId,
    originalSaleItemId: item.originalSaleItemId || item.saleItemId,
    lineStatus: String(item.lineStatus || "").toUpperCase() || null,
    canModify: Boolean(item.canModify),
    product,
    quantity: { sold, returned, remaining },
    exchange: normalizedExchange,
  };
};

/**
 * Map Nest GET /exchanges/eligible-sales sale row → table/UI.
 * Reads only the nested backend fields documented above.
 */
export const normalizeEligibleSale = (sale = {}) => {
  const student = sale.student || {};
  const branch = sale.branch || {};
  const payment = sale.payment || {};
  const image = payment.image || {};

  const totalAmount = toMoney(sale.totalAmount);
  const paidAmount = toMoney(sale.paidAmount);
  const status = String(sale.status || "COMPLETED").toUpperCase();
  const type = String(sale.type || "SALE").toUpperCase();
  const method = String(payment.method || "").toUpperCase();

  const items = (sale.items || []).map((item) =>
    normalizeEligibleSaleItem(item),
  );

  const normalizedPayment = {
    id: payment.id || null,
    method,
    methodLabel: getPaymentMethodLabel(method, payment.methodLabel || "—"),
    image: {
      reference: image.reference || null,
      url: image.url || null,
      hasProof: Boolean(image.hasProof),
    },
  };

  return {
    id: sale.id,
    saleId: sale.id,
    saleNumber: sale.saleNumber,
    branchId: sale.branchId,
    createdAt: sale.createdAt,
    createdAtLabel: formatDateTime(sale.createdAt, { empty: "—" }),
    type,
    typeLabel: SALE_ORIGIN_LABELS[type] || type,
    status,
    statusLabel: getSaleStatusLabel(status),
    canModify: Boolean(sale.canModify ?? items.some((i) => i.canModify)),
    totalAmount,
    paidAmount,
    totalAmountLabel: formatMoney(totalAmount),
    paidAmountLabel: formatMoney(paidAmount),
    quantitySummary: buildQuantitySummary(sale.quantitySummary || {}, items),
    student: {
      name: student.name || "-",
      phone: student.phone || "",
    },
    branch: {
      name: branch.name || "-",
    },
    payment: normalizedPayment,
    items,

    // Flat aliases for AppDataTable column fields only (derived from nested).
    studentName: student.name || "-",
    phone: student.phone || "",
    branchName: branch.name || "-",
  };
};

/**
 * Flat payload for exchange/refund dialogs.
 * Uses item.product from the backend line — no alternate-key guessing.
 */
export const toExchangeFlowSale = (saleRow, item) => {
  if (!saleRow || !item?.saleItemId || !item.product) return null;

  const product = item.product;
  const quantity = item.quantity || {};
  const lineStatus = String(
    item.lineStatus || saleRow.status || "COMPLETED",
  ).toUpperCase();

  return {
    id: `${saleRow.id}:${item.saleItemId}`,
    saleId: saleRow.id,
    saleItemId: item.saleItemId,
    branchId: saleRow.branchId,
    saleNumber: saleRow.saleNumber,
    createdAt: saleRow.createdAt,
    status: lineStatus,
    saleStatus: saleRow.status,
    lineStatus,
    statusLabel: getSaleStatusLabel(lineStatus),
    canModify: item.canModify,
    quantity,
    remainingQuantity: toQty(quantity.remaining),
    student: saleRow.student,
    branch: saleRow.branch,
    product,
    productId: product.id,
    payment: saleRow.payment,
  };
};
