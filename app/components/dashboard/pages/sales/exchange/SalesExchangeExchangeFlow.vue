<template>
  <div>
    <Dialog
      :visible="detailVisible"
      modal
      dir="rtl"
      header="استبدال منتج البيع"
      :style="{ width: '760px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="onDetailVisible"
    >
      <ExchangeDetailContent
        v-if="detailVisible && sale"
        :sale="sale"
        :exchange-quantity="exchangeQuantity"
        :quantity-error="quantityError"
        :new-product-id="newProductId"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparisonUi"
        :preview-loading="previewLoading"
        :exchange-error="exchangeError"
        :exchange-payment-error="exchangePaymentError"
        :exchange-payment-method="exchangePaymentMethod"
        :exchange-refund-method="exchangeRefundMethod"
        :exchange-image="exchangeImage"
        :exchange-proof-key="exchangeProofKey"
        @update:exchange-quantity="onExchangeQuantity"
        @update:new-product-id="onNewProductId"
        @update:exchange-payment-method="exchangePaymentMethod = $event"
        @update:exchange-refund-method="exchangeRefundMethod = $event"
        @update:exchange-image="exchangeImage = $event"
        @update:exchange-proof-key="exchangeProofKey = $event"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاستبدال"
            severity="primary"
            icon="pi pi-sync"
            :disabled="!canConfirmExchange"
            @click="requestConfirm"
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
      <ExchangeConfirmContent
        v-if="confirmVisible"
        :sale="sale"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparisonUi"
        :exchange-quantity="exchangeQuantity"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاستبدال"
            severity="primary"
            :loading="busy"
            :disabled="busy"
            @click="confirm"
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
import { exchangeService } from "~/services/exchangeService";
import { useAppToast } from "~/composables/useAppToast";
import {
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import {
  buildExchangeDiffLabels,
  getAvailabilityLabel,
} from "~/utils/domainLabels";
import { canSelectExchangeProduct } from "~/utils/productOptions";

const ExchangeDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/ExchangeDetailContent.vue"),
);
const ExchangeConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/ExchangeConfirmContent.vue"),
);

defineOptions({ name: "SalesExchangeExchangeFlow" });

const COMPARISON_UI = {
  more: {
    titleClass: "text-amber-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-amber-300",
  },
  less: {
    titleClass: "text-emerald-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-emerald-300",
  },
  same: {
    titleClass: "text-primary-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-primary-300",
  },
};

const props = defineProps({
  sale: { type: Object, default: null },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "done", "close"]);

const { showError, showSuccess } = useAppToast();

const busy = ref(false);
const previewLoading = ref(false);
const confirmVisible = ref(false);
const newProductId = ref(null);
const exchangeQuantity = ref(1);
const quantityError = ref("");
const preview = ref(null);
const exchangeError = ref("");
const exchangePaymentError = ref("");
const exchangePaymentMethod = ref(PaymentMethod.CASH);
const exchangeRefundMethod = ref(PaymentMethod.CASH);
const exchangeImage = ref(null);
const exchangeProofKey = ref("");

let previewRequestId = 0;

const detailVisible = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const maxQuantity = computed(() =>
  Math.max(1, Number(props.sale?.remainingQuantity || 1)),
);

const selectedNewProduct = computed(() => {
  const product = preview.value?.newProduct;
  if (!product) return null;
  const isAvailable = Boolean(product.availability ?? product.isAvailable);
  const reservationAllowed = Boolean(product.reservationAllowed);
  return {
    ...product,
    isAvailable,
    reservationAllowed,
    availabilityLabel: isAvailable
      ? getAvailabilityLabel(product.availability ?? product.isAvailable)
      : reservationAllowed
        ? "متاح للحجز"
        : "غير متاح",
  };
});

const isQuantityValid = computed(() => {
  const qty = Number(exchangeQuantity.value);
  return (
    Number.isInteger(qty) && qty >= 1 && qty <= maxQuantity.value
  );
});

const canConfirmExchange = computed(() => {
  if (!props.sale || busy.value || previewLoading.value) return false;
  if (!newProductId.value || !preview.value) return false;
  if (String(newProductId.value) === String(props.sale?.productId || "")) {
    return false;
  }
  if (!isQuantityValid.value) return false;
  if (!canSelectExchangeProduct(selectedNewProduct.value)) return false;

  if (preview.value.kind === "more") {
    if (!exchangePaymentMethod.value) return false;
    if (
      paymentMethodNeedsProof(exchangePaymentMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      return false;
    }
  }

  if (preview.value.kind === "less") {
    if (!exchangeRefundMethod.value) return false;
    if (
      paymentMethodNeedsProof(exchangeRefundMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      return false;
    }
  }

  return true;
});

const priceComparisonUi = computed(() => {
  if (!preview.value?.kind) return null;
  const ui = COMPARISON_UI[preview.value.kind] || COMPARISON_UI.same;
  const labels = buildExchangeDiffLabels(preview.value);
  return {
    ...preview.value,
    ...ui,
    ...labels,
  };
});

const clampQuantity = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), maxQuantity.value);
};

const validateQuantity = () => {
  quantityError.value = "";
  const qty = Number(exchangeQuantity.value);
  if (!Number.isInteger(qty) || qty < 1) {
    quantityError.value = "أدخل كمية صحيحة لا تقل عن 1.";
    return false;
  }
  if (qty > maxQuantity.value) {
    quantityError.value = `الحد الأقصى للاستبدال هو ${maxQuantity.value}.`;
    return false;
  }
  return true;
};

const resetFields = () => {
  newProductId.value = null;
  exchangeQuantity.value = maxQuantity.value;
  quantityError.value = "";
  preview.value = null;
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangePaymentMethod.value = PaymentMethod.CASH;
  exchangeRefundMethod.value = PaymentMethod.CASH;
  exchangeImage.value = null;
  exchangeProofKey.value = "";
  confirmVisible.value = false;
  previewLoading.value = false;
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

const loadPreview = async (productId, quantity) => {
  if (!props.sale?.saleId || !props.sale?.saleItemId || !productId) {
    preview.value = null;
    return;
  }

  const qty = clampQuantity(quantity);
  const requestId = ++previewRequestId;
  previewLoading.value = true;
  exchangeError.value = "";
  try {
    const result = await exchangeService.previewExchange({
      saleId: props.sale.saleId,
      saleItemId: props.sale.saleItemId,
      newProductId: productId,
      quantity: qty,
    });
    if (requestId !== previewRequestId) return;
    preview.value = result;
  } catch (error) {
    if (requestId !== previewRequestId) return;
    preview.value = null;
    exchangeError.value = error?.message || "تعذر حساب فرق السعر.";
  } finally {
    if (requestId === previewRequestId) previewLoading.value = false;
  }
};

const onNewProductId = (value) => {
  newProductId.value = value;
  exchangePaymentError.value = "";
  if (!value) {
    preview.value = null;
    exchangeError.value = "";
    return;
  }
  if (!validateQuantity()) {
    preview.value = null;
    return;
  }
  loadPreview(value, exchangeQuantity.value);
};

const onExchangeQuantity = (value) => {
  exchangeQuantity.value = clampQuantity(value);
  quantityError.value = "";
  exchangePaymentError.value = "";
  if (!newProductId.value) return;
  if (!validateQuantity()) {
    preview.value = null;
    return;
  }
  loadPreview(newProductId.value, exchangeQuantity.value);
};

const requestConfirm = () => {
  exchangeError.value = "";
  exchangePaymentError.value = "";

  if (!validateQuantity()) return;

  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === props.sale?.productId) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  if (!preview.value) {
    exchangeError.value = "انتظر حساب فرق السعر أو أعد اختيار المنتج.";
    return;
  }
  if (!canSelectExchangeProduct(preview.value?.newProduct)) {
    exchangeError.value =
      "المنتج المختار غير متاح في مخزون الفرع لهذه الكمية وغير مسموح بالحجز.";
    return;
  }

  if (preview.value.kind === "more") {
    if (!exchangePaymentMethod.value) {
      exchangePaymentError.value = "اختر طريقة تحصيل فرق السعر.";
      return;
    }
    if (
      paymentMethodNeedsProof(exchangePaymentMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value =
        "صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.";
      return;
    }
  }

  if (preview.value.kind === "less") {
    if (!exchangeRefundMethod.value) {
      exchangePaymentError.value = "اختر طريقة رد فرق السعر.";
      return;
    }
    if (
      paymentMethodNeedsProof(exchangeRefundMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value =
        "صورة إثبات الرد مطلوبة لطريقة الرد المحددة.";
      return;
    }
  }

  confirmVisible.value = true;
};

const confirm = async () => {
  if (!props.sale?.saleId || !props.sale?.saleItemId || !newProductId.value) {
    return;
  }
  if (!validateQuantity()) return;

  busy.value = true;
  try {
    const payload = {
      saleId: props.sale.saleId,
      saleItemId: props.sale.saleItemId,
      newProductId: newProductId.value,
      quantity: clampQuantity(exchangeQuantity.value),
    };

    if (preview.value?.kind === "more") {
      payload.paymentMethod = exchangePaymentMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    } else if (preview.value?.kind === "less") {
      payload.refundMethod = exchangeRefundMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    }

    await exchangeService.createExchange(payload);
    confirmVisible.value = false;
    detailVisible.value = false;
    resetFields();
    showSuccess("تم استبدال المنتج بنجاح.");
    emit("done");
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاستبدال.");
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

watch(
  () => props.sale?.remainingQuantity,
  () => {
    if (props.open) {
      exchangeQuantity.value = maxQuantity.value;
    }
  },
);
</script>
