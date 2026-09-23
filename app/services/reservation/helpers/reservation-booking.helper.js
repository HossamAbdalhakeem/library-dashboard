import { getPaymentMethodLabel } from "~/enums/paymentMethod";
import { formatDateTime } from "~/utils/format/datetime";

/**
 * Map create-reservation API response → booking success summary.
 * Nested product/student/payment only — no flat amount/name fallbacks.
 *
 * `selectedProduct` / `studentName` / `method` come from the form selection
 * (study year is not on the reservation API response).
 */
export const normalizeReservationCreateResult = ({
  result,
  selectedProduct,
  studentName,
  method,
  proofImage = "",
}) => {
  if (!result?.id || !result?.reservationNumber) return null;

  const product = result.product || {};
  const payment = result.payment || {};
  const student = result.student || {};

  return {
    reservationNumber: result.reservationNumber,
    dateTimeLabel: formatDateTime(result.createdAt),
    productName: product.name || selectedProduct?.name || "",
    teacherName:
      product.teacher?.name || selectedProduct?.teacherName || "",
    studyYearName: selectedProduct?.studyYearName || "",
    studentName: student.name || studentName || "-",
    paidAmount: Number(payment.paidAmount ?? 0),
    totalAmount: Number(product.totalAmount ?? 0),
    methodLabel: getPaymentMethodLabel(method),
    proofImage: proofImage || "",
  };
};
