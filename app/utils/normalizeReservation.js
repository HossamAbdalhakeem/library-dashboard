import { formatMoney, formatDateTime } from "~/utils/format";
import { getPaymentMethodLabel } from "~/utils/paymentMethods";
import { getUserRoleLabel } from "~/enums/userRole";
import { getStatusTagMeta } from "~/utils/statusTags";

const toMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/**
 * Map Nest reservation response (nested product/payment/image) to table/UI.
 *
 * API shape:
 *   product{ id, name, teacher{name}, unitPrice, totalAmount }
 *   payment{ id, method, methodLabel, paidAmount, remainingAmount, image{ reference, url, hasProof } }
 *   student{ name, phone }, branch{ name }, createdBy{ fullName, role }
 */
export const normalizeReservation = (item = {}) => {
  const product = item.product || {};
  const payment = item.payment || {};
  const image = payment.image || {};
  const student = item.student || {};
  const branch = item.branch || {};
  const createdBy = item.createdBy || {};

  const quantity = Number(item.quantity ?? 1);
  const paidAmount = toMoney(payment.paidAmount);
  const sellingPrice = toMoney(product.unitPrice);
  const totalAmount = toMoney(product.totalAmount);
  const remainingAmount = toMoney(payment.remainingAmount);
  const status = String(item.status || "").toUpperCase();
  const statusMeta = getStatusTagMeta("reservation", status);
  const paymentMethod = String(payment.method || "").toUpperCase();
  const createdByName = createdBy.fullName || "-";
  const createdByRole = createdBy.role || "";
  const productId = product.id || item.productId || null;
  const teacherName = product.teacher?.name || "-";

  const normalizedProduct = {
    id: productId,
    name: product.name || "-",
    teacher: product.teacher ? { name: teacherName } : null,
    teacherName,
    unitPrice: sellingPrice,
    totalAmount,
    unitPriceLabel: sellingPrice > 0 ? formatMoney(sellingPrice) : "—",
    totalAmountLabel: formatMoney(totalAmount),
  };

  const normalizedPayment = {
    id: payment.id ?? null,
    method: paymentMethod,
    methodLabel: getPaymentMethodLabel(
      paymentMethod,
      payment.methodLabel || "—",
    ),
    paidAmount,
    remainingAmount,
    hasRemaining: remainingAmount > 0,
    paidAmountLabel: formatMoney(paidAmount),
    remainingAmountLabel: formatMoney(remainingAmount),
    image: {
      reference: image.reference ?? null,
      url: image.url ?? null,
      hasProof: Boolean(image.hasProof),
    },
  };

  return {
    id: item.id,
    reservationNumber: item.reservationNumber,
    branchId: item.branchId,
    quantity,
    status,
    createdAt: item.createdAt,
    createdAtLabel: formatDateTime(item.createdAt, { empty: "—" }),
    student: {
      name: student.name || "-",
      phone: student.phone || "",
    },
    branch: {
      name: branch.name || "-",
    },
    createdBy: {
      fullName: createdByName,
      role: createdByRole,
      roleLabel: getUserRoleLabel(createdByRole),
    },
    product: normalizedProduct,
    payment: normalizedPayment,
    statusLabel:
      remainingAmount > 0 && status === "READY"
        ? "جاهز · متبقي مبلغ"
        : statusMeta.label,

    // Flat aliases for AppDataTable field binding
    productId,
    productName: normalizedProduct.name,
    productCell: {
      name: normalizedProduct.name,
      price:
        sellingPrice > 0 ? normalizedProduct.unitPriceLabel : null,
      teacherName: teacherName !== "-" ? teacherName : null,
    },
    teacherName,
    studentName: student.name || "-",
    phone: student.phone || "",
    branchName: branch.name || "-",
    createdByName,
    createdByRole,
    createdByRoleLabel: getUserRoleLabel(createdByRole),
    createdByLabel: createdByName,
    sellingPrice,
    sellingPriceLabel: normalizedProduct.unitPriceLabel,
    totalAmount,
    paidAmount,
    paidAmountLabel: normalizedPayment.paidAmountLabel,
    remainingAmount,
    remainingAmountLabel: normalizedPayment.remainingAmountLabel,
    hasRemaining: normalizedPayment.hasRemaining,
    paymentId: normalizedPayment.id,
    paymentMethod: normalizedPayment.method,
    paymentMethodLabel: normalizedPayment.methodLabel,
    proofReference: normalizedPayment.image.reference,
    proofUrl: normalizedPayment.image.url,
    hasProof: normalizedPayment.image.hasProof,
  };
};

