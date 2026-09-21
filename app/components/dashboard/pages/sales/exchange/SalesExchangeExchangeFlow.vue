<template>
  <div>
    <ExchangeFlowDetailDialog
      :visible="detailVisible"
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
      :can-confirm="canConfirmExchange"
      :busy="busy"
      @update:visible="onDetailVisible"
      @update:exchange-quantity="onExchangeQuantity"
      @update:new-product-id="onNewProductId"
      @update:exchange-payment-method="exchangePaymentMethod = $event"
      @update:exchange-refund-method="exchangeRefundMethod = $event"
      @update:exchange-image="exchangeImage = $event"
      @update:exchange-proof-key="exchangeProofKey = $event"
      @confirm="requestConfirm"
      @close="close"
    />

    <ExchangeFlowConfirmDialog
      :visible="confirmVisible"
      :busy="busy"
      :sale="sale"
      :selected-new-product="selectedNewProduct"
      :price-comparison="priceComparisonUi"
      :exchange-quantity="exchangeQuantity"
      @update:visible="(v) => (confirmVisible = v)"
      @confirm="confirm"
    />
  </div>
</template>

<script setup>
import ExchangeFlowDetailDialog from "~/components/dashboard/pages/sales/exchange/partials/ExchangeFlowDetailDialog.vue";
import ExchangeFlowConfirmDialog from "~/components/dashboard/pages/sales/exchange/partials/ExchangeFlowConfirmDialog.vue";
import { useSalesExchangeExchangeFlow } from "~/components/dashboard/pages/sales/exchange/composables/useSalesExchangeExchangeFlow";

defineOptions({ name: "SalesExchangeExchangeFlow" });

const props = defineProps({
  sale: { type: Object, default: null },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "done", "close"]);

const {
  busy,
  previewLoading,
  confirmVisible,
  newProductId,
  exchangeQuantity,
  quantityError,
  exchangeError,
  exchangePaymentError,
  exchangePaymentMethod,
  exchangeRefundMethod,
  exchangeImage,
  exchangeProofKey,
  detailVisible,
  selectedNewProduct,
  canConfirmExchange,
  priceComparisonUi,
  close,
  onDetailVisible,
  onNewProductId,
  onExchangeQuantity,
  requestConfirm,
  confirm,
} = useSalesExchangeExchangeFlow(props, emit);
</script>
