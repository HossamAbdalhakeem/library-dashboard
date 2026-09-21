<template>
  <div>
    <Dialog
      :visible="detailVisible"
      modal
      dir="rtl"
      header="استبدال منتج الحجز"
      :style="{ width: '720px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="onDetailVisible"
    >
      <ExchangeReservationDetailContent
        v-if="detailVisible && reservation"
        :reservation="reservation"
        :new-product-id="newProductId"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparison"
        :exchange-error="exchangeError"
        :exchange-payment-error="exchangePaymentError"
        :exchange-refund-method="exchangeRefundMethod"
        :exchange-image="exchangeImage"
        :exchange-proof-key="exchangeProofKey"
        @update:new-product-id="newProductId = $event"
        @update:exchange-refund-method="exchangeRefundMethod = $event"
        @update:exchange-image="exchangeImage = $event"
        @update:exchange-proof-key="exchangeProofKey = $event"
        @products-loaded="onExchangeProductsLoaded"
        @products-loading="(value) => (loadingProducts = value)"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاستبدال"
            severity="primary"
            icon="pi pi-sync"
            :disabled="!canConfirmExchange"
            @click="requestExchangeConfirm"
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
      header="تأكيد استبدال المنتج"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '520px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="(v) => (confirmVisible = v)"
    >
      <ExchangeReservationConfirmContent
        v-if="confirmVisible"
        :reservation="reservation"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparison"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاستبدال"
            severity="primary"
            :loading="busy"
            :disabled="busy"
            @click="confirmExchange"
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
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";
import { PaymentMethod } from "~/utils/paymentMethods";
import { formatMoney } from "~/utils/format";
import { canSelectExchangeProduct } from "~/utils/productOptions";

defineOptions({ name: "ReservationsExchangeFlow" });

const ExchangeReservationDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/ExchangeReservationDetailContent.vue"),
);
const ExchangeReservationConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/ExchangeReservationConfirmContent.vue"),
);

const props = defineProps({
  reservation: { type: Object, default: null },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "done", "close"]);

const { showError, showSuccess } = useAppToast();

const busy = ref(false);
const loadingProducts = ref(false);
const confirmVisible = ref(false);
const productOptions = ref([]);
const newProductId = ref(null);
const exchangeError = ref("");
const exchangePaymentError = ref("");
const exchangeRefundMethod = ref(PaymentMethod.CASH);
const exchangeImage = ref(null);
const exchangeProofKey = ref("");

const detailVisible = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const selectedNewProduct = computed(
  () =>
    productOptions.value.find((item) => item.value === newProductId.value) ||
    null,
);

const priceComparison = computed(() => {
  if (!props.reservation || !selectedNewProduct.value) return null;

  const paidAmount = roundMoney(props.reservation.payment?.paidAmount);
  const newPrice = roundMoney(selectedNewProduct.value.displayPrice);
  const difference = roundMoney(newPrice - paidAmount);

  if (difference >= 0) return null;

  return {
    kind: "less",
    oldTotal: paidAmount,
    newTotal: newPrice,
    difference,
    title: "سيتم رد فرق السعر للطالب",
    titleClass: "text-emerald-300",
    boxClass: "border-white/10 bg-slate-900",
    diffLabel: "المبلغ الذي سيُرد للطالب",
    diffClass: "text-emerald-300",
    confirmText: `سيتم رد فرق سعر قدره ${formatMoney(Math.abs(difference))} للطالب.`,
  };
});

const canConfirmExchange = computed(() => {
  if (!props.reservation || busy.value || loadingProducts.value) {
    return false;
  }
  if (!newProductId.value || !selectedNewProduct.value) return false;
  if (
    String(newProductId.value) === String(props.reservation?.product?.id || "")
  ) {
    return false;
  }
  if (!canSelectExchangeProduct(selectedNewProduct.value)) return false;
  if (priceComparison.value?.kind === "less" && !exchangeRefundMethod.value) {
    return false;
  }
  return true;
});

const onExchangeProductsLoaded = (options) => {
  productOptions.value = options || [];
};

const resetFields = () => {
  newProductId.value = null;
  productOptions.value = [];
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangeRefundMethod.value = PaymentMethod.CASH;
  exchangeImage.value = null;
  exchangeProofKey.value = "";
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

const requestExchangeConfirm = () => {
  exchangeError.value = "";
  exchangePaymentError.value = "";

  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === props.reservation?.product?.id) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  if (!canSelectExchangeProduct(selectedNewProduct.value)) {
    exchangeError.value =
      "المنتج المختار غير متاح في مخزون الفرع وغير مسموح بالحجز.";
    return;
  }
  if (priceComparison.value?.kind === "less" && !exchangeRefundMethod.value) {
    exchangePaymentError.value = "اختر طريقة رد فرق السعر.";
    return;
  }

  confirmVisible.value = true;
};

const confirmExchange = async () => {
  if (!props.reservation?.id || !newProductId.value) return;
  busy.value = true;
  try {
    const payload = { newProductId: newProductId.value };

    if (priceComparison.value?.kind === "less") {
      payload.refundMethod = exchangeRefundMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    }

    await reservationService.changeProduct(props.reservation.id, payload);
    confirmVisible.value = false;
    detailVisible.value = false;
    resetFields();
    showSuccess("تم استبدال منتج الحجز بنجاح.");
    emit("done");
  } catch (error) {
    showError(error?.message || "تعذر استبدال منتج الحجز.");
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

watch(newProductId, () => {
  if (exchangeError.value) exchangeError.value = "";
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});

watch(exchangeRefundMethod, () => {
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});
</script>
