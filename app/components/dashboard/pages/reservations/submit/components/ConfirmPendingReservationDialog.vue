<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="تأكيد دفع الحجز"
    :style="{ width: 'min(640px, 96vw)' }"
    :closable="!submitting"
    @update:visible="onVisible"
  >
    <div v-if="reservation" class="space-y-4 text-right text-sm text-slate-200">
      <div class="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3">
        <p>رقم الحجز: {{ reservation.reservationNumber }}</p>
        <p class="mt-1">الطالب: {{ reservation.studentName }} · {{ reservation.phone || "—" }}</p>
        <p class="mt-1">المنتج: {{ reservation.productName }}</p>
        <p class="mt-1">العربون: {{ reservation.depositAmountLabel }}</p>
      </div>

      <PaymentFields
        ref="paymentFieldsRef"
        v-model:method="method"
        v-model:image="proofFile"
        v-model:image-data-url="proofKey"
        v-model:image-preview-url="proofPreviewUrl"
        v-model:fee-enabled="feeEnabled"
        v-model:fee-amount="feeAmount"
        show-fee
        show-proof-source-choice
        method-label="طريقة الدفع"
        image-label="صورة إثبات الدفع"
        :method-invalid="Boolean(formError && !method)"
        :image-invalid="proofInvalid"
        show-image-when="non-cash"
        require-image-when="non-cash"
      />

      <p v-if="formError" class="text-sm text-red-300">{{ formError }}</p>
    </div>

    <template #footer>
      <Button label="إلغاء" severity="secondary" text :disabled="submitting" @click="close" />
      <Button label="تأكيد الحجز" :loading="submitting" @click="requestSummary" />
    </template>
  </Dialog>

  <PaymentConfirmDialog
    v-model:visible="summaryVisible"
    :saving="submitting"
    header="تأكيد دفع الحجز"
    confirm-label="تأكيد الحجز"
    lead="تأكيد دفع"
    :summary="confirmSummary"
    @confirm="submit"
  >
    <template #extra>
      <PaymentSummaryRow
        label="رقم الحجز"
        :value="reservation?.reservationNumber"
      />
      <PaymentSummaryRow label="الكمية" :value="reservation?.quantity ?? 1" />
    </template>
  </PaymentConfirmDialog>

  <PaymentSuccessDialog
    v-model:visible="successVisible"
    title="تم تأكيد الحجز بنجاح"
    reference-label="رقم الحجز"
    :reference-value="successSummary?.reservationNumber"
    reference-value-class="text-xl font-extrabold tracking-wide text-emerald-700 break-all"
    :summary="successSummary"
    :product-amount="successSummary?.productAmount"
    :show-study-year="false"
    method-position="after-fee"
  >
    <template #extra>
      <PaymentSummaryRow label="الكمية" :value="successSummary?.quantity ?? 1" />
    </template>
    <template #footnote>
      تم تأكيد الحجز وحجز الكمية حسب مخزون الفرع
    </template>
  </PaymentSuccessDialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import PaymentFields from "~/components/shared/payment/payment-fields/index.vue";
import PaymentConfirmDialog from "~/components/shared/dialog/payment-confirm-dialog/index.vue";
import PaymentSuccessDialog from "~/components/shared/dialog/payment-success-dialog/index.vue";
import PaymentSummaryRow from "~/components/shared/dialog/payment-summary-row/index.vue";
import {
  PaymentMethod,
  getPaymentMethodLabel,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";
import { reservationApi } from "~/services/reservation";
import { useAppToast } from "~/composables/useAppToast";
import { formatDateTime } from "~/utils/format/datetime";
import { feeAmountForRequest } from "~/utils/payment-fee";

defineOptions({ name: "ConfirmPendingReservationDialog" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  reservation: { type: Object, default: null },
});

const emit = defineEmits(["update:visible", "confirmed"]);

const { showSuccess, showError } = useAppToast();
const submitting = ref(false);
const formError = ref("");
const method = ref(PaymentMethod.CASH);
const proofFile = ref(null);
const proofKey = ref("");
const proofPreviewUrl = ref("");
const feeEnabled = ref(false);
const feeAmount = ref(null);
const paymentFieldsRef = ref(null);
const summaryVisible = ref(false);
const successVisible = ref(false);
const successSummary = ref(null);

const proofInvalid = computed(
  () => paymentMethodNeedsProof(method.value) && !String(proofKey.value || "").trim(),
);

const teacherNameOf = (reservation) => {
  const name = reservation?.teacherName || reservation?.product?.teacher?.name || "";
  return name && name !== "-" ? name : "";
};

const resolvedFeeAmount = () =>
  feeAmountForRequest({
    method: method.value,
    enabled: feeEnabled.value,
    amount: feeAmount.value,
  });

const confirmSummary = computed(() => ({
  productName: props.reservation?.productName,
  teacherName: teacherNameOf(props.reservation),
  studentName: props.reservation?.studentName,
  productAmount: props.reservation?.depositAmount ?? 0,
  feeAmount: resolvedFeeAmount(),
}));

watch(
  () => props.visible,
  (open) => {
    if (!open) return;
    submitting.value = false;
    formError.value = "";
    method.value = PaymentMethod.CASH;
    proofFile.value = null;
    proofKey.value = "";
    proofPreviewUrl.value = "";
    feeEnabled.value = false;
    feeAmount.value = null;
    summaryVisible.value = false;
  },
);

const onVisible = (value) => {
  if (submitting.value) return;
  emit("update:visible", value);
};

const close = () => emit("update:visible", false);

const requestSummary = () => {
  if (!props.reservation?.id) return;
  formError.value = "";
  if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) return;
  summaryVisible.value = true;
};

const submit = async () => {
  if (!props.reservation?.id) return;
  formError.value = "";

  const resolvedFee = resolvedFeeAmount();
  const summary = {
    reservationNumber: props.reservation.reservationNumber,
    dateTimeLabel: formatDateTime(new Date()),
    productName: props.reservation.productName,
    teacherName: teacherNameOf(props.reservation),
    studentName: props.reservation.studentName,
    quantity: props.reservation.quantity ?? 1,
    productAmount: props.reservation.depositAmount ?? 0,
    feeAmount: resolvedFee,
    method: method.value,
    methodLabel: getPaymentMethodLabel(method.value),
    paymentId: "",
    hasProof: Boolean(proofPreviewUrl.value),
    proofImage: proofPreviewUrl.value || "",
  };

  submitting.value = true;
  try {
    await reservationApi.confirmReservation(props.reservation.id, {
      method: method.value,
      ...(proofKey.value ? { proofReference: proofKey.value } : {}),
      ...(resolvedFee != null ? { feeAmount: resolvedFee } : {}),
    });
    summaryVisible.value = false;
    successSummary.value = summary;
    successVisible.value = true;
    showSuccess("تم تأكيد الحجز وحجز الكمية حسب مخزون الفرع.");
    emit("confirmed", props.reservation.id);
    emit("update:visible", false);
  } catch (error) {
    summaryVisible.value = false;
    formError.value = error?.message || "تعذر تأكيد الحجز.";
    showError(formError.value);
  } finally {
    submitting.value = false;
  }
};
</script>
