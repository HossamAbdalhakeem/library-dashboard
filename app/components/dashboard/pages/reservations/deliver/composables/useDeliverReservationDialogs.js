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
  const successVisible = ref(false);
  const dialogError = ref("");
  const selectedReservation = ref(null);
  const successReservation = ref(null);
  const successCollectedRemaining = ref(false);
  const successMethodLabel = ref("-");

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
    deliverDetailContentRef.value?.resetPayment?.();
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
          })
        : {};

      await reservationApi.deliverReservation(
        reservationSnapshot.id,
        payload,
      );

      confirmVisible.value = false;
      closeDetailDialog();

      successReservation.value = reservationSnapshot;
      successCollectedRemaining.value = collectedRemaining;
      successMethodLabel.value = collectedMethodLabel;
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
    successVisible,
    dialogError,
    selectedReservation,
    successReservation,
    successCollectedRemaining,
    successMethodLabel,
    methodLabel,
    dialogTitle,
    needsRemainingPayment,
    canConfirmDeliver,
    open,
    isDeliverable,
    closeDetailDialog,
    closeSuccessDialog,
    requestDeliverConfirmation,
    deliverReservation,
  };
}
