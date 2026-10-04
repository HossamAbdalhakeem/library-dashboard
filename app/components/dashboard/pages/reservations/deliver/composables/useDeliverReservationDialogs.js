import {
  reservationApi,
  buildDeliverReservationPayload,
} from "~/services/reservation";
import { useAppToast } from "~/composables/useAppToast";
import {
  getPaymentMethodLabel,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";
import { formatDateTime } from "~/utils/format/datetime";
import { feeAmountForRequest } from "~/utils/payment-fee";

/**
 * Deliver reservation dialogs: open/confirm/success flow and payment validation.
 */
export function useDeliverReservationDialogs(emit) {
  const { showError, showSuccess } = useAppToast();

  const delivering = ref(false);
  const paymentMethod = ref(PaymentMethod.CASH);
  const proofFile = ref(null);
  const proofKey = ref("");
  const proofPreviewUrl = ref("");
  const proofRequiredError = ref(false);
  const deliverDetailContentRef = ref(null);
  const methodError = ref("");
  const dialogVisible = ref(false);
  const confirmVisible = ref(false);
  const feeEnabled = ref(false);
  const feeAmount = ref(null);
  const successVisible = ref(false);
  const dialogError = ref("");
  const selectedReservation = ref(null);
  const successReservation = ref(null);
  const successCollectedRemaining = ref(false);
  const successMethodLabel = ref("-");
  const successFeeAmount = ref(null);
  const successSummary = ref(null);

  const methodLabel = computed(() =>
    getPaymentMethodLabel(paymentMethod.value),
  );

  const dialogTitle = computed(() =>
    selectedReservation.value
      ? `تسليم الحجز ${selectedReservation.value.reservationNumber}`
      : "تسليم الحجز",
  );

  const needsRemainingPayment = computed(() =>
    Boolean(selectedReservation.value?.payment?.hasRemaining),
  );

  const isDeliverable = (item) => item?.status === "READY";

  const canConfirmDeliver = computed(() => {
    if (
      !selectedReservation.value ||
      !isDeliverable(selectedReservation.value)
    ) {
      return false;
    }
    if (!needsRemainingPayment.value) return true;
    return Boolean(paymentMethod.value);
  });

  const resetPaymentFields = () => {
    paymentMethod.value = PaymentMethod.CASH;
    proofFile.value = null;
    proofKey.value = "";
    proofPreviewUrl.value = "";
    proofRequiredError.value = false;
    methodError.value = "";
    feeEnabled.value = false;
    feeAmount.value = null;
    deliverDetailContentRef.value?.resetPayment?.();
  };

  const resolvedFeeAmount = () =>
    feeAmountForRequest({
      method: paymentMethod.value,
      enabled: feeEnabled.value,
      amount: feeAmount.value,
    });

  const teacherNameOf = (reservation) => {
    const name =
      reservation?.teacherName || reservation?.product?.teacher?.name || "";
    return name && name !== "-" ? name : "";
  };

  const open = (item) => {
    if (!isDeliverable(item)) return;
    selectedReservation.value = item;
    resetPaymentFields();
    dialogError.value = "";
    successVisible.value = false;
    confirmVisible.value = false;
    dialogVisible.value = true;
  };

  const closeDetailDialog = () => {
    dialogVisible.value = false;
    confirmVisible.value = false;
    selectedReservation.value = null;
    resetPaymentFields();
    dialogError.value = "";
  };

  const closeSuccessDialog = () => {
    successVisible.value = false;
    successReservation.value = null;
    successCollectedRemaining.value = false;
    successMethodLabel.value = "-";
    successFeeAmount.value = null;
    successSummary.value = null;
  };

  const validateRemainingPayment = () => {
    methodError.value = "";
    proofRequiredError.value = false;

    if (!needsRemainingPayment.value) return true;

    if (!paymentMethod.value) {
      methodError.value = "اختر طريقة دفع المبلغ المتبقي.";
      return false;
    }

    if (
      deliverDetailContentRef.value &&
      !deliverDetailContentRef.value.validatePayment()
    ) {
      proofRequiredError.value = true;
      return false;
    }

    if (paymentMethodNeedsProof(paymentMethod.value) && !proofKey.value) {
      proofRequiredError.value = true;
      return false;
    }

    return true;
  };

  const requestDeliverConfirmation = () => {
    if (
      !selectedReservation.value ||
      !isDeliverable(selectedReservation.value)
    ) {
      return;
    }
    if (!validateRemainingPayment()) return;
    dialogError.value = "";
    confirmVisible.value = true;
  };

  const deliverReservation = async () => {
    if (
      !selectedReservation.value ||
      !isDeliverable(selectedReservation.value)
    ) {
      return;
    }
    if (!validateRemainingPayment()) {
      confirmVisible.value = false;
      return;
    }

    delivering.value = true;
    dialogError.value = "";

    const reservationSnapshot = { ...selectedReservation.value };
    const collectedRemaining = needsRemainingPayment.value;
    const collectedMethodLabel = methodLabel.value;

    try {
      const payload = collectedRemaining
        ? buildDeliverReservationPayload({
            method: paymentMethod.value,
            proofReference:
              paymentMethodNeedsProof(paymentMethod.value) && proofKey.value
                ? proofKey.value
                : undefined,
            feeAmount: resolvedFeeAmount(),
          })
        : {};

      await reservationApi.deliverReservation(
        reservationSnapshot.id,
        payload,
      );

      const feeSnapshot = collectedRemaining ? resolvedFeeAmount() : null;
      const proofImage = proofPreviewUrl.value || "";
      const collectedMethod = paymentMethod.value;
      confirmVisible.value = false;
      closeDetailDialog();

      successReservation.value = reservationSnapshot;
      successCollectedRemaining.value = collectedRemaining;
      successMethodLabel.value = collectedMethodLabel;
      successFeeAmount.value = feeSnapshot;
      successSummary.value = collectedRemaining
        ? {
            reservationNumber: reservationSnapshot.reservationNumber,
            dateTimeLabel: formatDateTime(new Date()),
            productName:
              reservationSnapshot.productName ||
              reservationSnapshot.product?.name ||
              "",
            teacherName: teacherNameOf(reservationSnapshot),
            studentName:
              reservationSnapshot.studentName ||
              reservationSnapshot.student?.name ||
              "",
            quantity: reservationSnapshot.quantity ?? 1,
            productAmount:
              reservationSnapshot.remainingAmount ??
              reservationSnapshot.payment?.remainingAmount ??
              0,
            feeAmount: feeSnapshot,
            method: collectedMethod,
            methodLabel: collectedMethodLabel,
            paymentId: "",
            hasProof: Boolean(proofImage),
            proofImage,
          }
        : null;
      successVisible.value = true;

      emit("delivered", reservationSnapshot.id);
      showSuccess(
        collectedRemaining
          ? "تم تسليم الحجز بنجاح وتحصيل المبلغ المتبقي وخصم الكمية من المخزون."
          : "تم تسليم الحجز بنجاح وخصم الكمية من المخزون.",
      );
    } catch (error) {
      const message = error?.message || "تعذر تسليم الحجز.";
      confirmVisible.value = false;
      dialogError.value = message;
      showError(message);
    } finally {
      delivering.value = false;
    }
  };

  watch(paymentMethod, () => {
    if (methodError.value) methodError.value = "";
    proofRequiredError.value = false;
  });

  return {
    delivering,
    paymentMethod,
    proofFile,
    proofKey,
    proofPreviewUrl,
    proofRequiredError,
    deliverDetailContentRef,
    methodError,
    dialogVisible,
    confirmVisible,
    feeEnabled,
    feeAmount,
    successVisible,
    dialogError,
    selectedReservation,
    successReservation,
    successCollectedRemaining,
    successMethodLabel,
    successFeeAmount,
    successSummary,
    methodLabel,
    dialogTitle,
    needsRemainingPayment,
    canConfirmDeliver,
    open,
    isDeliverable,
    closeDetailDialog,
    closeSuccessDialog,
    requestDeliverConfirmation,
    resolvedFeeAmount,
    deliverReservation,
  };
}
