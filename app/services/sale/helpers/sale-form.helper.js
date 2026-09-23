import { formatDateTime } from "~/utils/format/datetime";
import {
  getPaymentMethodLabel,
  normalizePaymentMethod,
  PaymentMethod,
} from "~/enums/paymentMethod";

export const emptySaleForm = () => ({
  studentId: null,
  productId: null,
  quantity: 1,
  method: PaymentMethod.CASH,
  proofReference: "",
});

/**
 * Build create body matching CreateSaleDto.
 * Request body uses flat FK ids (DTO contract).
 */
export const buildSalePayload = (form) => {
  const payload = {
    studentId: form.studentId,
    productId: form.productId,
    quantity: Number(form.quantity || 1),
    method: normalizePaymentMethod(form.method || PaymentMethod.CASH),
  };

  if (form.proofReference) {
    payload.proofReference = String(form.proofReference).trim();
  }

  return payload;
};

export const validateSaleForm = (form) => {
  if (!form?.studentId) return "اختر طالباً من القائمة أو أضف طالباً جديداً.";
  if (!form?.productId) return "اختر منتجاً.";
  if (Number(form?.quantity || 0) < 1) return "الكمية يجب أن تكون 1 على الأقل.";
  if (!form?.method) return "اختر طريقة الدفع.";
  return null;
};

/** Map API sale → detail/display (nested relations only). */
export const normalizeSaleDetail = (sale = {}) => {
  if (!sale?.id) return null;

  const student = sale.student || null;
  const branch = sale.branch || null;
  const payment = sale.payment || {};
  const image = payment.image || {};
  const items = Array.isArray(sale.items) ? sale.items : [];

  return {
    id: sale.id,
    status: sale.status,
    totalAmount: sale.totalAmount,
    createdAt: sale.createdAt,
    student: student
      ? {
          id: student.id,
          name: student.name || "-",
          phone: student.phone || "",
        }
      : null,
    branch: branch ? { id: branch.id, name: branch.name || "-" } : null,
    academicYear: sale.academicYear || null,
    createdBy: sale.createdBy || null,
    reservation: sale.reservation || null,
    items,
    payment: {
      id: payment.id || null,
      method: normalizePaymentMethod(payment.method),
      methodLabel:
        payment.methodLabel ||
        getPaymentMethodLabel(payment.method),
      image: {
        reference: image.reference || null,
        url: image.url || null,
        hasProof: Boolean(image.hasProof),
      },
    },
    payments: Array.isArray(sale.payments) ? sale.payments : [],
    returns: Array.isArray(sale.returns) ? sale.returns : [],
    exchanges: Array.isArray(sale.exchanges) ? sale.exchanges : [],
  };
};

/**
 * Map create/detail sale API → success-dialog summary.
 * Reads nested items[0] / payment / student only.
 */
export const mapSaleToSuccessSummary = (
  sale,
  { product, studentName, proofImage, needsProof } = {},
) => {
  const detail = normalizeSaleDetail(sale);
  if (!detail?.id || !detail.payment?.id) return null;

  const item = detail.items[0] || {};
  const itemProduct = item.product || {};
  const method = detail.payment.method;

  return {
    paymentNumber: detail.payment.id,
    dateTimeLabel: formatDateTime(detail.createdAt),
    productName: product?.name || itemProduct.name || "-",
    teacherName:
      product?.teacherName || itemProduct.teacher?.name || "",
    studyYearName:
      product?.studyYearName || itemProduct.studyYear?.name || "",
    studentName: studentName || detail.student?.name || "-",
    quantity: item.quantity ?? 0,
    unitPrice: Number(item.unitPrice ?? 0),
    totalAmount: Number(detail.totalAmount ?? 0),
    methodLabel:
      detail.payment.methodLabel || getPaymentMethodLabel(method),
    proofImage: needsProof ? proofImage || "" : "",
  };
};
