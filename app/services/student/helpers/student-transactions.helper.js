import { formatMoney } from "~/utils/format/money";
import {
  PaymentMethod,
  getPaymentMethodLabel,
} from "~/enums/paymentMethod";
import { getStatusTagMeta, getStatusTagSeverity } from "~/utils/status-tags/catalog";
import { getReservationStatusLabel } from "~/utils/domain-labels/reservation";
import { getSaleStatusLabel } from "~/utils/domain-labels/sale";
import { getTransactionTypeLabel } from "~/utils/domain-labels/transaction";
import { normalizePaymentSummary } from "~/services/payment";

const TYPE_META = {
  SALE: getStatusTagMeta("transaction", "SALE"),
  RESERVATION: getStatusTagMeta("transaction", "RESERVATION"),
  RETURN: getStatusTagMeta("transaction", "RETURN"),
  EXCHANGE: getStatusTagMeta("transaction", "EXCHANGE"),
};

const statusSeverity = (status, type) => {
  const normalizedType = String(type || "").toUpperCase();
  if (normalizedType === "SALE") return "success";
  if (normalizedType === "RETURN") return "danger";
  if (normalizedType === "EXCHANGE") {
    return getStatusTagSeverity("sale", status);
  }
  return getStatusTagSeverity("reservation", status);
};

/** Map API transaction row → table display (nested product/branch/payment only). */
export const normalizeStudentTransaction = (item) => {
  const type = String(item.type || "").toUpperCase();
  const typeMeta = TYPE_META[type] || {
    label: getTransactionTypeLabel(type),
    severity: "warn",
  };
  const productName = item.product?.name || null;
  const teacherName = item.product?.teacher?.name || null;
  const branchName = item.branch?.name || "—";
  const status = item.status || "";
  const statusLabel =
    type === "SALE" || type === "RETURN" || type === "EXCHANGE"
      ? getSaleStatusLabel(status)
      : getReservationStatusLabel(status);
  const payment = normalizePaymentSummary(item.payment);
  const paymentMethod = payment.method || PaymentMethod.CASH;

  return {
    ...item,
    type,
    typeLabel: typeMeta.label,
    date: item.date,
    amountLabel: formatMoney(item.amount ?? 0),
    productName: productName || "—",
    teacherName: teacherName ? `أ. ${teacherName}` : "—",
    productCell: {
      name: productName,
      teacherName,
      studyYearName: null,
    },
    branchName,
    quantity: item.quantity ?? "—",
    statusLabel,
    payment,
    paymentId: payment.id,
    paymentMethod,
    paymentMethodLabel:
      payment.methodLabel || getPaymentMethodLabel(paymentMethod),
    proofUrl: payment.image.url,
    hasProof: payment.image.hasProof,
    statusSeverity: statusSeverity(status, type),
  };
};
