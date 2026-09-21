import {
  PAYMENT_METHOD_LABELS,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import { formatDateTime } from "~/utils/format";
import { useAppToast } from "~/composables/useAppToast";

const RESERVATION_QUANTITY = 1;

/**
 * Reservation submit, proof validation, and success dialog state.
 */
export function useBookingSubmit({
  form,
  props,
  isCustomerService,
  selectedStudent,
  selectedProductOption,
  validateDepositAmount,
  amountError,
}) {
  const { showError } = useAppToast();

  const saving = ref(false);
  const reservationSummary = ref(null);
  const successDialogVisible = ref(false);
  const proofFile = ref(null);
  const proofKey = ref("");
  const proofPreviewUrl = ref("");
  const proofRequiredError = ref(false);
  const paymentFieldsRef = ref(null);

  const ensureStudent = async () => {
    if (!selectedStudent.value?.id) {
      throw new Error("اختر طالباً من القائمة أو أضف طالباً جديداً.");
    }

    form.studentName = selectedStudent.value.name;
    form.studentPhone = selectedStudent.value.phone;
    return selectedStudent.value.id;
  };

  const closeSuccessDialog = () => {
    successDialogVisible.value = false;
    reservationSummary.value = null;
  };

  const handleSubmit = async () => {
    amountError.value = "";
    proofRequiredError.value = false;

    if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) {
      proofRequiredError.value = true;
      return;
    }

    if (!validateDepositAmount()) {
      return;
    }

    saving.value = true;

    try {
      if (isCustomerService.value && !form.branchId) {
        throw new Error("اختيار الفرع مطلوب.");
      }

      const studentId = await ensureStudent();
      const product = selectedProductOption.value;
      const method = form.paymentMethod;
      const needsProof = paymentMethodNeedsProof(method);
      const deposit = Number(form.amount || 0);

      const result = await props.submitFn({
        studentId,
        productId: form.productId,
        quantity: RESERVATION_QUANTITY,
        deposit,
        method,
        ...(form.branchId ? { branchId: form.branchId } : {}),
        ...(needsProof && proofKey.value
          ? { proofReference: proofKey.value }
          : {}),
      });

      if (!result?.id || !result?.reservationNumber) {
        throw new Error("تعذر قراءة بيانات الحجز من الخادم.");
      }

      reservationSummary.value = {
        reservationNumber: result.reservationNumber,
        dateTimeLabel: formatDateTime(result.createdAt),
        productName: product?.name || result.product?.name || "",
        teacherName:
          product?.teacherName || result.product?.teacher?.name || "",
        studyYearName: product?.studyYearName || "",
        studentName: form.studentName || result.student?.name || "-",
        paidAmount: Number(result.payment?.paidAmount ?? result.paidAmount),
        totalAmount: Number(
          result.product?.totalAmount ?? result.totalAmount,
        ),
        methodLabel: PAYMENT_METHOD_LABELS[method] || method,
        proofImage: needsProof ? proofPreviewUrl.value || "" : "",
      };

      successDialogVisible.value = true;
    } catch (error) {
      showError(error?.message || "تعذر تسجيل الحجز.");
    } finally {
      saving.value = false;
    }
  };

  return {
    saving,
    reservationSummary,
    successDialogVisible,
    proofFile,
    proofKey,
    proofPreviewUrl,
    proofRequiredError,
    paymentFieldsRef,
    closeSuccessDialog,
    handleSubmit,
    showError,
  };
}
