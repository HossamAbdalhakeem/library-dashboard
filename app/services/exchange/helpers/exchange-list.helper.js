import { formatMoney } from "~/utils/format/money";
import { formatDateTime } from "~/utils/format/datetime";
import { isFiniteNumber, toFiniteNumber } from "~/utils/format/number";
import { getPaymentMethodLabel, normalizePaymentMethod } from "~/enums/paymentMethod";
import { getSaleStatusLabel } from "~/utils/domain-labels/sale";

const SALE_ORIGIN_LABELS = {
  SALE: "بيع مباشر",
  RESERVATION: "من حجز",
};

const toMoney = (value) => {
  if (!isFiniteNumber(value)) return 0;
  return Math.round(Number(value) * 100) / 100;
};

const toQty = (value) => toFiniteNumber(value, 0);

const normalizeTeacher = (teacher) => {
  if (!teacher?.name) return null;
  return {
    ...(teacher.id != null ? { id: teacher.id } : {}),
    name: teacher.name,
  };
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
 * Nested student/branch/product only — no flat FK guessing.
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
  const method = normalizePaymentMethod(payment.method);

  const items = (sale.items || []).map((item) =>
    normalizeEligibleSaleItem(item),
  );

  const normalizedPayment = {
    id: payment.id || null,
    method,
    methodLabel: payment.methodLabel || getPaymentMethodLabel(method),
    image: {
      reference: image.reference || null,
      url: image.url || null,
      hasProof: Boolean(image.hasProof),
    },
  };

  return {
    id: sale.id,
    saleNumber: sale.saleNumber || sale.id,
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
      ...(student.id != null ? { id: student.id } : {}),
      name: student.name || "-",
      phone: student.phone || "",
    },
    branch: branch.id
      ? { id: branch.id, name: branch.name || "-" }
      : { name: branch.name || "-" },
    payment: normalizedPayment,
    items,

    // Flat aliases for AppDataTable column fields only (derived from nested).
    studentName: student.name || "-",
    phone: student.phone || "",
    branchName: branch.name || "-",
  };
};

export const buildEligibleSalesQuery = ({ page, perPage, filters = {} }) => {
  const params = {
    page,
    per_page: perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.academicYearId) params.academicYearId = filters.academicYearId;
  return params;
};
