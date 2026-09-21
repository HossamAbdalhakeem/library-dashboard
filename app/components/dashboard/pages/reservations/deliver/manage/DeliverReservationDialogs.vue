<template>
  <div>
    <Dialog
      v-model:visible="dialogVisible"
      modal
      dir="rtl"
      :header="dialogTitle"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{
        root: { class: 'deliver-dialog' },
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
      @hide="closeDetailDialog"
    >
      <DeliverReservationDetailContent
        v-if="dialogVisible && selectedReservation"
        ref="deliverDetailContentRef"
        :reservation="selectedReservation"
        :needs-remaining-payment="needsRemainingPayment"
        :payment-method="paymentMethod"
        :proof-file="proofFile"
        :proof-key="proofKey"
        :proof-preview-url="proofPreviewUrl"
        :method-error="methodError"
        :proof-required-error="proofRequiredError"
        :dialog-error="dialogError"
        @update:payment-method="paymentMethod = $event"
        @update:proof-file="proofFile = $event"
        @update:proof-key="proofKey = $event"
        @update:proof-preview-url="proofPreviewUrl = $event"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد التسليم"
            class="rounded-xl bg-[#f5af52] px-5 py-2 font-bold text-white"
            :disabled="!canConfirmDeliver || delivering"
            :loading="delivering"
            @click="requestDeliverConfirmation"
          />
          <Button
            label="إلغاء"
            text
            severity="secondary"
            @click="closeDetailDialog"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="confirmVisible"
      modal
      dir="rtl"
      header="تأكيد التسليم"
      :closable="!delivering"
      :dismissableMask="!delivering"
      :closeOnEscape="!delivering"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
    >
      <DeliverReservationConfirmContent
        v-if="confirmVisible"
        :reservation="selectedReservation"
        :needs-remaining-payment="needsRemainingPayment"
        :method-label="methodLabel"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            :label="
              needsRemainingPayment
                ? 'نعم، تم التحصيل والتسليم'
                : 'نعم، تأكيد التسليم'
            "
            class="rounded-xl bg-[#f5af52] px-5 py-2 font-bold text-white"
            :loading="delivering"
            :disabled="delivering"
            @click="deliverReservation"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="delivering"
            @click="confirmVisible = false"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="successVisible"
      modal
      dir="rtl"
      header="نتيجة التسليم"
      :style="{ width: '480px', maxWidth: '95vw' }"
      :pt="{
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
      @hide="closeSuccessDialog"
    >
      <DeliverReservationSuccessContent
        v-if="successVisible && successReservation"
        :reservation="successReservation"
        :collected-remaining="successCollectedRemaining"
        :method-label="successMethodLabel"
      />

      <template #footer>
        <div class="flex w-full justify-end">
          <Button
            label="إغلاق"
            class="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white"
            @click="closeSuccessDialog"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";

defineOptions({ name: "DeliverReservationDialogs" });

const DeliverReservationDetailContent = defineAsyncComponent(() =>
  import("./DeliverReservationDetailContent.vue"),
);
const DeliverReservationConfirmContent = defineAsyncComponent(() =>
  import("./DeliverReservationConfirmContent.vue"),
);
const DeliverReservationSuccessContent = defineAsyncComponent(() =>
  import("./DeliverReservationSuccessContent.vue"),
);

const emit = defineEmits(["delivered"]);

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

const methodLabel = computed(
  () => PAYMENT_METHOD_LABELS[paymentMethod.value] || paymentMethod.value || "-",
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
  if (!selectedReservation.value || !isDeliverable(selectedReservation.value)) {
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
  if (!selectedReservation.value || !isDeliverable(selectedReservation.value)) {
    return;
  }
  if (!validateRemainingPayment()) return;
  dialogError.value = "";
  confirmVisible.value = true;
};

const deliverReservation = async () => {
  if (!selectedReservation.value || !isDeliverable(selectedReservation.value)) {
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
    const payload = {};
    if (collectedRemaining) {
      payload.method = paymentMethod.value;
      if (paymentMethodNeedsProof(paymentMethod.value) && proofKey.value) {
        payload.proofReference = proofKey.value;
      }
    }

    await reservationService.deliverReservation(
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

defineExpose({
  open,
  isDeliverable,
});
</script>
