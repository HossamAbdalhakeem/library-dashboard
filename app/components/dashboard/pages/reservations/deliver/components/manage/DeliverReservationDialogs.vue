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
            data-testid="deliver-confirm"
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
            data-testid="deliver-confirm-yes"
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
import { useDeliverReservationDialogs } from "../../composables/useDeliverReservationDialogs";

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

const {
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
} = useDeliverReservationDialogs(emit);

defineExpose({
  open,
  isDeliverable,
});
</script>
