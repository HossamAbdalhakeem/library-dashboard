import { formatMoney } from "~/utils/format/money";
import { formatDateTime } from "~/utils/format/datetime";
import { isFiniteNumber } from "~/utils/format/number";
import { getPaymentMethodLabel, normalizePaymentMethod } from "~/enums/paymentMethod";
import { getUserRoleLabel } from "~/enums/userRole";
import { getStatusTagMeta } from "~/utils/status-tags/catalog";

const toMoney = (value) => {
  if (!isFiniteNumber(value)) return 0;
  return Math.round(Number(value) * 100) / 100;
};

/**
 * Map Nest reservation list/detail row → table/UI.
 * Nested student/branch/product/payment/createdBy only — no flat FK guessing.
 *
 * API shape:
 *   product{ id, name, teacher{id,name}, unitPrice, totalAmount }
 *   payment{ id, method, methodLabel, paidAmount, remainingAmount, image{...} }
 *   student{ id, name, phone }, branch{ id, name }, createdBy{ id, fullName, role }
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
  const paymentMethod = normalizePaymentMethod(payment.method);
  const createdByName = createdBy.fullName || "-";
  const createdByRole = createdBy.role || "";
  const productId = product.id || null;
  const teacherName = product.teacher?.name || "-";

  const normalizedProduct = {
    id: productId,
    name: product.name || "-",
    teacher: product.teacher?.name
      ? {
          ...(product.teacher.id != null ? { id: product.teacher.id } : {}),
          name: product.teacher.name,
        }
      : null,
    teacherName,
    unitPrice: sellingPrice,
    totalAmount,
    unitPriceLabel: sellingPrice > 0 ? formatMoney(sellingPrice) : "—",
    totalAmountLabel: formatMoney(totalAmount),
  };

  const normalizedPayment = {
    id: payment.id ?? null,
    method: paymentMethod,
    methodLabel: payment.methodLabel || getPaymentMethodLabel(paymentMethod),
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

  const normalizedStudent = {
    ...(student.id != null ? { id: student.id } : {}),
    name: student.name || "-",
    phone: student.phone || "",
  };

  const normalizedBranch = branch.id
    ? { id: branch.id, name: branch.name || "-" }
    : { name: branch.name || "-" };

  return {
    id: item.id,
    reservationNumber: item.reservationNumber,
    quantity,
    status,
    createdAt: item.createdAt,
    createdAtLabel: formatDateTime(item.createdAt, { empty: "—" }),
    student: normalizedStudent,
    branch: normalizedBranch,
    createdBy: {
      ...(createdBy.id != null ? { id: createdBy.id } : {}),
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

    // Flat aliases for AppDataTable column fields only (derived from nested).
    productId,
    productName: normalizedProduct.name,
    productCell: {
      name: normalizedProduct.name,
      price: sellingPrice > 0 ? normalizedProduct.unitPriceLabel : null,
      teacherName: teacherName !== "-" ? teacherName : null,
    },
    teacherName,
    studentName: normalizedStudent.name,
    phone: normalizedStudent.phone,
    branchId: normalizedBranch.id || null,
    branchName: normalizedBranch.name,
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

export const buildReservationListQuery = ({
  page,
  perPage,
  filters = {},
}) => {
  const params = {
    page,
    per_page: perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.status) {
    params.status = Array.isArray(filters.status)
      ? filters.status.join(",")
      : filters.status;
  }
  if (filters.academicYearId) params.academicYearId = filters.academicYearId;
  if (filters.branchId) params.branchId = filters.branchId;
  return params;
};
