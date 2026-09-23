import {
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";
import { useAppToast } from "~/composables/useAppToast";
import {
  buildCreateReservationPayload,
  normalizeReservationCreateResult,
} from "~/services/reservation";

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

      const result = await props.submitFn(
        buildCreateReservationPayload({
          studentId,
          productId: form.productId,
          quantity: RESERVATION_QUANTITY,
          deposit,
          method,
          branchId: form.branchId || undefined,
          proofReference:
            needsProof && proofKey.value ? proofKey.value : undefined,
        }),
      );

      const summary = normalizeReservationCreateResult({
        result,
        selectedProduct: product,
        studentName: form.studentName,
        method,
        proofImage: needsProof ? proofPreviewUrl.value || "" : "",
      });

      if (!summary) {
        throw new Error("تعذر قراءة بيانات الحجز من الخادم.");
      }

      reservationSummary.value = summary;
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
