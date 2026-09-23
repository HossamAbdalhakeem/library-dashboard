import { formatMoney } from "~/utils/format/money";
import { formatDateTime } from "~/utils/format/datetime";
import { isFiniteNumber } from "~/utils/format/number";
import {
  getPaymentMethodLabel,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";
import { getSaleStatusLabel } from "~/utils/domain-labels/sale";

const toMoney = (value) => {
  if (!isFiniteNumber(value)) return 0;
  return Math.round(Number(value) * 100) / 100;
};

/**
 * Map Nest GET /sales row → table/UI.
 * Nested student/branch/product/payment only — no flat FK guessing.
 */
export const normalizeSaleListItem = (sale = {}) => {
  const student = sale.student || {};
  const branch = sale.branch || {};
  const academicYear = sale.academicYear || {};
  const payment = sale.payment || {};
  const image = payment.image || {};
  const firstItem = Array.isArray(sale.items) ? sale.items[0] : null;
  const product = firstItem?.product || {};

  const totalAmount = toMoney(sale.totalAmount);
  const status = String(sale.status || "COMPLETED").toUpperCase();
  const method = normalizePaymentMethod(payment.method);
  const quantity = Array.isArray(sale.items)
    ? sale.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
    : 0;

  const products = Array.isArray(sale.items)
    ? sale.items
        .map(
          (item) =>
            `${item?.product?.name || "-"} × ${item?.quantity ?? 0}`,
        )
        .join(", ")
    : "-";

  return {
    ...sale,
    status,
    statusLabel: getSaleStatusLabel(status),
    totalAmount,
    totalAmountLabel: formatMoney(totalAmount),
    quantity,
    products: products || "-",
    createdAtLabel: formatDateTime(sale.createdAt, { empty: "—" }),
    student: {
      id: student.id || null,
      name: student.name || "-",
      phone: student.phone || "",
    },
    branch: branch.id
      ? { id: branch.id, name: branch.name || "-" }
      : null,
    academicYear: academicYear.id
      ? {
          id: academicYear.id,
          name: academicYear.name || "-",
          ...(academicYear.status != null ? { status: academicYear.status } : {}),
        }
      : null,
    payment: {
      id: payment.id || null,
      method,
      methodLabel: payment.methodLabel || getPaymentMethodLabel(method),
      image: {
        reference: image.reference || null,
        url: image.url || null,
        hasProof: Boolean(image.hasProof),
      },
    },
    product: product.id
      ? {
          id: product.id,
          name: product.name || "-",
          teacher: product.teacher || null,
          studyYear: product.studyYear || null,
        }
      : null,

    // Flat aliases for AppDataTable column fields only (derived from nested).
    studentName: student.name || "-",
    phone: student.phone || "",
    branchName: branch.name || "-",
    academicYearName: academicYear.name || "-",
    productName: product.name || "-",
    createdByName: sale.createdBy?.fullName || "-",
  };
};

export const buildSaleListQuery = ({ filters = {} } = {}) => {
  const params = {};
  if (filters.academicYearId) params.academicYearId = filters.academicYearId;
  return params;
};
