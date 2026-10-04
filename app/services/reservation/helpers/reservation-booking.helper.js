import { getPaymentMethodLabel } from "~/enums/paymentMethod";
import { formatDateTime } from "~/utils/format/datetime";

/**
 * Map the slim create-reservation response onto the booking success summary.
 * Product, student, amounts, and payment method come from the form.
 * The API only supplies the reservation number, timestamp, and payment id.
 */
export const normalizeReservationCreateResult = ({
  result,
  selectedProduct,
  studentName,
  method,
  paidAmount,
  totalAmount,
  feeAmount = null,
  proofImage = "",
}) => {
  if (!result?.id || !result?.reservationNumber) return null;

  return {
    reservationNumber: result.reservationNumber,
    dateTimeLabel: formatDateTime(result.createdAt),
    productName: selectedProduct?.name || "",
    teacherName: selectedProduct?.teacherName || "",
    studyYearName: selectedProduct?.studyYearName || "",
    studentName: studentName || "-",
    paidAmount: Number(paidAmount ?? 0),
    totalAmount: Number(totalAmount ?? 0),
    feeAmount,
    method,
    methodLabel: getPaymentMethodLabel(method),
    paymentId: result.paymentId || null,
    hasProof: Boolean(proofImage),
    proofImage: proofImage || "",
  };
};
