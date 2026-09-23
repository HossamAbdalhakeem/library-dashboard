<template>
  <div>
    <Dialog
      :visible="detailVisible"
      modal
      dir="rtl"
      header="تفاصيل الحجز قبل الإلغاء"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="onDetailVisible"
    >
      <CancelReservationDetailContent
        v-if="detailVisible"
        :reservation="reservation"
        :refund-method="cancelRefundMethod"
        :refund-image="cancelImage"
        :refund-proof-key="cancelProofKey"
        :refund-error="cancelRefundError"
        @update:refund-method="cancelRefundMethod = $event"
        @update:refund-image="cancelImage = $event"
        @update:refund-proof-key="cancelProofKey = $event"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد إلغاء الحجز"
            severity="danger"
            icon="pi pi-times"
            :disabled="!reservation || busy"
            @click="requestCancelConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="close"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      :visible="confirmVisible"
      modal
      dir="rtl"
      header="تأكيد الإلغاء"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="(v) => (confirmVisible = v)"
    >
      <CancelReservationConfirmContent
        v-if="confirmVisible"
        :reservation="reservation"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، إلغاء الحجز"
            severity="danger"
            :loading="busy"
            :disabled="busy"
            @click="confirmCancel"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="confirmVisible = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import {
  reservationApi,
  buildCancelReservationPayload,
} from "~/services/reservation";
import { useAppToast } from "~/composables/useAppToast";
import { PaymentMethod } from "~/enums/paymentMethod";

defineOptions({ name: "ReservationsCancelFlow" });

const CancelReservationDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/components/manage/CancelReservationDetailContent.vue"),
);
const CancelReservationConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/components/manage/CancelReservationConfirmContent.vue"),
);

const props = defineProps({
  reservation: { type: Object, default: null },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "done", "close"]);

const { showError, showSuccess } = useAppToast();

const busy = ref(false);
const confirmVisible = ref(false);
const cancelRefundMethod = ref(PaymentMethod.CASH);
const cancelImage = ref(null);
const cancelProofKey = ref("");
const cancelRefundError = ref("");

const detailVisible = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const resetFields = () => {
  cancelRefundMethod.value = PaymentMethod.CASH;
  cancelImage.value = null;
  cancelProofKey.value = "";
  cancelRefundError.value = "";
  confirmVisible.value = false;
};

const close = () => {
  if (busy.value) return;
  detailVisible.value = false;
  resetFields();
  emit("close");
};

const onDetailVisible = (value) => {
  if (!value) close();
  else detailVisible.value = true;
};

const requestCancelConfirm = () => {
  cancelRefundError.value = "";
  if (props.reservation?.payment?.paidAmount > 0 && !cancelRefundMethod.value) {
    cancelRefundError.value = "اختر طريقة رد المبلغ.";
    return;
  }
  confirmVisible.value = true;
};

const confirmCancel = async () => {
  if (!props.reservation?.id) return;
  busy.value = true;
  try {
    const payload =
      props.reservation.payment?.paidAmount > 0
        ? buildCancelReservationPayload({
            refundMethod: cancelRefundMethod.value,
            proofReference: cancelProofKey.value || undefined,
          })
        : {};

    await reservationApi.cancelReservation(props.reservation.id, payload);
    confirmVisible.value = false;
    detailVisible.value = false;
    resetFields();
    showSuccess("تم إلغاء الحجز بنجاح.");
    emit("done");
  } catch (error) {
    showError(error?.message || "تعذر إلغاء الحجز.");
  } finally {
    busy.value = false;
  }
};

watch(
  () => props.open,
  (open) => {
    if (open) resetFields();
  },
);

watch(cancelRefundMethod, () => {
  if (cancelRefundError.value) cancelRefundError.value = "";
});

watch(cancelProofKey, () => {
  if (cancelRefundError.value) cancelRefundError.value = "";
});
</script>
