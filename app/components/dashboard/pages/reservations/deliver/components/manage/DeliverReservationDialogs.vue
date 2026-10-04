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
        :fee-enabled="feeEnabled"
        :fee-amount="feeAmount"
        @update:payment-method="paymentMethod = $event"
        @update:proof-file="proofFile = $event"
        @update:proof-key="proofKey = $event"
        @update:proof-preview-url="proofPreviewUrl = $event"
        @update:fee-enabled="feeEnabled = $event"
        @update:fee-amount="feeAmount = $event"
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

    <PaymentConfirmDialog
      v-if="needsRemainingPayment"
      v-model:visible="confirmVisible"
      :saving="delivering"
      header="تأكيد التسليم"
      confirm-label="نعم، تم التحصيل والتسليم"
      lead="تأكيد تسليم"
      amount-label="السعر المتبقي"
      :summary="confirmSummary"
      @confirm="deliverReservation"
    >
      <template #extra>
        <PaymentSummaryRow
          label="رقم الحجز"
          :value="selectedReservation?.reservationNumber"
        />
        <PaymentSummaryRow
          label="الكمية"
          :value="selectedReservation?.quantity ?? 1"
        />
      </template>
    </PaymentConfirmDialog>

    <Dialog
      v-else
      v-model:visible="confirmVisible"
      modal
      dir="rtl"
      header="تأكيد التسليم"
      :closable="!delivering"
      :dismissable-mask="!delivering"
      :close-on-escape="!delivering"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
    >
      <DeliverReservationConfirmContent
        v-if="confirmVisible"
        :reservation="selectedReservation"
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

    <PaymentSuccessDialog
      v-if="successCollectedRemaining"
      v-model:visible="successVisible"
      title="تم تسليم الحجز بنجاح"
      reference-label="رقم الحجز"
      :reference-value="successSummary?.reservationNumber"
      reference-value-class="text-xl font-extrabold tracking-wide text-emerald-700 break-all"
      :summary="successSummary"
      :product-amount="successSummary?.productAmount"
      amount-label="السعر المتبقي"
      :show-study-year="false"
      @close="closeSuccessDialog"
    >
      <template #extra>
        <PaymentSummaryRow label="الكمية" :value="successSummary?.quantity ?? 1" />
      </template>
      <template #footnote>
        تم خصم الكمية من المخزون وتحصيل المبلغ المتبقي
      </template>
    </PaymentSuccessDialog>

    <Dialog
      v-else
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
      />

      <template #footer>
        <div class="flex w-full justify-center">
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
import PaymentConfirmDialog from "~/components/shared/dialog/payment-confirm-dialog/index.vue";
import PaymentSuccessDialog from "~/components/shared/dialog/payment-success-dialog/index.vue";
import PaymentSummaryRow from "~/components/shared/dialog/payment-summary-row/index.vue";
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
  feeEnabled,
  feeAmount,
  successVisible,
  dialogError,
  selectedReservation,
  successReservation,
  successCollectedRemaining,
  successSummary,
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
} = useDeliverReservationDialogs(emit);

const confirmSummary = computed(() => {
  const reservation = selectedReservation.value;
  if (!reservation) return null;
  const teacherName = reservation.teacherName || reservation.product?.teacher?.name || "";
  return {
    productName: reservation.productName || reservation.product?.name,
    teacherName: teacherName && teacherName !== "-" ? teacherName : "",
    studentName: reservation.studentName || reservation.student?.name,
    productAmount:
      reservation.remainingAmount ?? reservation.payment?.remainingAmount ?? 0,
    feeAmount: resolvedFeeAmount(),
  };
});

defineExpose({
  open,
  isDeliverable,
});
</script>
