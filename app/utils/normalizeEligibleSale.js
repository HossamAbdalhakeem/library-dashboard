import { formatMoney, formatDateTime } from "~/utils/format";
import {
  getPaymentMethodLabel,
  PAYMENT_METHOD_LABELS,
} from "~/utils/paymentMethods";
import { getSaleStatusLabel } from "~/utils/domainLabels";

const toMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/**
 * Map Nest GET /exchanges/eligible-sales row to table/UI.
 *
 * API shape:
 *   quantity{ sold, returned, remaining }
 *   student{ name, phone }, branch{ name }
 *   product{ id, name, teacher{name}, unitPrice, amount, refundAmount }
 *   payment{ id, method, methodLabel, image{ reference, url, hasProof } }
 */
export const normalizeEligibleSale = (item = {}) => {
  const quantity = item.quantity || {};
  const product = item.product || {};
  const payment = item.payment || {};
  const image = payment.image || {};
  const student = item.student || {};
  const branch = item.branch || {};

  const remainingQuantity = Number(
    quantity.remaining ?? item.remainingQuantity ?? 0,
  );
  const returnedQuantity = Number(
    quantity.returned ?? item.returnedQuantity ?? 0,
  );
  const soldQuantity = Number(
    quantity.sold ??
      (typeof item.quantity === "number" ? item.quantity : 0),
  );
  const unitPrice = toMoney(product.unitPrice ?? item.unitPrice);
  const amount = toMoney(product.amount ?? item.amount);
  const refundAmount = toMoney(
    product.refundAmount ?? item.refundAmount ?? amount,
  );
  const status = String(item.status || "").toUpperCase();
  const paymentMethod = String(
    payment.method || item.paymentMethod || "",
  ).toUpperCase();
  const productId = product.id || item.productId || null;
  const teacherName = product.teacher?.name || item.teacherName || "-";

  const normalizedProduct = {
    id: productId,
    name: product.name || item.productName || "-",
    teacher: product.teacher ? { name: teacherName } : null,
    teacherName,
    unitPrice,
    amount,
    refundAmount,
    unitPriceLabel: formatMoney(unitPrice),
    amountLabel: formatMoney(amount),
    refundAmountLabel: formatMoney(refundAmount),
  };

  const normalizedPayment = {
    id: payment.id ?? item.paymentId ?? null,
    method: paymentMethod,
    methodLabel:
      getPaymentMethodLabel(paymentMethod) ||
      payment.methodLabel ||
      PAYMENT_METHOD_LABELS[paymentMethod] ||
      paymentMethod ||
      "—",
    image: {
      reference: image.reference ?? item.proofReference ?? null,
      url: image.url ?? item.proofUrl ?? null,
      hasProof: Boolean(image.hasProof ?? item.hasProof),
    },
  };

  return {
    id: item.id,
    saleId: item.saleId,
    saleItemId: item.saleItemId,
    branchId: item.branchId,
    saleNumber: item.saleNumber || item.saleId,
    createdAt: item.createdAt,
    createdAtLabel: formatDateTime(item.createdAt, { empty: "—" }),
    status,
    statusLabel: getSaleStatusLabel(status),
    canModify: Boolean(item.canModify),
    quantity: {
      sold: soldQuantity,
      returned: returnedQuantity,
      remaining: remainingQuantity,
    },
    student: {
      name: student.name || item.studentName || "-",
      phone: student.phone || item.phone || "",
    },
    branch: {
      name: branch.name || item.branchName || "-",
    },
    product: normalizedProduct,
    payment: normalizedPayment,

    // Flat aliases for AppDataTable / existing flow code
    productId,
    productName: normalizedProduct.name,
    productCell: {
      name: normalizedProduct.name,
      price: normalizedProduct.unitPriceLabel,
      teacherName: teacherName !== "-" ? teacherName : null,
    },
    teacherName,
    studentName: student.name || item.studentName || "-",
    phone: student.phone || item.phone || "",
    branchName: branch.name || item.branchName || "-",
    remainingQuantity,
    returnedQuantity,
    soldQuantity,
    unitPrice,
    amount,
    refundAmount,
    unitPriceLabel: normalizedProduct.unitPriceLabel,
    amountLabel: normalizedProduct.amountLabel,
    refundAmountLabel: normalizedProduct.refundAmountLabel,
    paymentId: normalizedPayment.id,
    paymentMethod: normalizedPayment.method,
    paymentMethodLabel: normalizedPayment.methodLabel,
    proofReference: normalizedPayment.image.reference,
    proofUrl: normalizedPayment.image.url,
    hasProof: normalizedPayment.image.hasProof,
  };
};
