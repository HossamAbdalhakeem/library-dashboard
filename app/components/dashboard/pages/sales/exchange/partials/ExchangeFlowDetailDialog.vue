<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="استبدال منتج البيع"
    :style="{ width: '760px', maxWidth: '95vw' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    @update:visible="emit('update:visible', $event)"
  >
    <ExchangeDetailContent
      v-if="visible && sale"
      :sale="sale"
      :exchange-quantity="exchangeQuantity"
      :quantity-error="quantityError"
      :new-product-id="newProductId"
      :selected-new-product="selectedNewProduct"
      :price-comparison="priceComparison"
      :preview-loading="previewLoading"
      :exchange-error="exchangeError"
      :exchange-payment-error="exchangePaymentError"
      :exchange-payment-method="exchangePaymentMethod"
      :exchange-refund-method="exchangeRefundMethod"
      :exchange-image="exchangeImage"
      :exchange-proof-key="exchangeProofKey"
      @update:exchange-quantity="emit('update:exchangeQuantity', $event)"
      @update:new-product-id="emit('update:newProductId', $event)"
      @update:exchange-payment-method="
        emit('update:exchangePaymentMethod', $event)
      "
      @update:exchange-refund-method="
        emit('update:exchangeRefundMethod', $event)
      "
      @update:exchange-image="emit('update:exchangeImage', $event)"
      @update:exchange-proof-key="emit('update:exchangeProofKey', $event)"
    />

    <template #footer>
      <div class="flex w-full justify-start gap-2">
        <Button
          label="تأكيد الاستبدال"
          severity="primary"
          icon="pi pi-sync"
          :disabled="!canConfirm"
          @click="emit('confirm')"
        />
        <Button
          label="رجوع"
          text
          severity="secondary"
          :disabled="busy"
          @click="emit('close')"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";

const ExchangeDetailContent = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/sales/exchange/manage/ExchangeDetailContent.vue"
  ),
);

defineOptions({ name: "ExchangeFlowDetailDialog" });

defineProps({
  visible: { type: Boolean, default: false },
  sale: { type: Object, default: null },
  exchangeQuantity: { type: [Number, String], default: 1 },
  quantityError: { type: String, default: "" },
  newProductId: { type: [Number, String], default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  previewLoading: { type: Boolean, default: false },
  exchangeError: { type: String, default: "" },
  exchangePaymentError: { type: String, default: "" },
  exchangePaymentMethod: { type: String, default: "" },
  exchangeRefundMethod: { type: String, default: "" },
  exchangeImage: { type: [Object, File, String], default: null },
  exchangeProofKey: { type: String, default: "" },
  canConfirm: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:visible",
  "update:exchangeQuantity",
  "update:newProductId",
  "update:exchangePaymentMethod",
  "update:exchangeRefundMethod",
  "update:exchangeImage",
  "update:exchangeProofKey",
  "confirm",
  "close",
]);
</script>
