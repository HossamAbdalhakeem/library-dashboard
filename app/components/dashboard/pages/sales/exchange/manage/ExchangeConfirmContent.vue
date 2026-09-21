<template>
  <AppConfirmContent
    :notice="priceComparison?.confirmText || ''"
    :notice-class="noticeClass"
  >
    <template #message>
      <p>
        هل أنت متأكد من استبدال
        <span class="font-bold text-slate-900">{{ exchangeQuantity }}</span>
        من منتج العملية
        <span class="font-bold text-slate-900">
          {{ sale?.saleNumber }}
        </span>
        ؟
      </p>
    </template>

    <AppSwapPreview
      :from-title="sale?.productName"
      :from-subtitle="fromSubtitle"
      :to-title="selectedNewProduct?.name || '—'"
      :to-subtitle="toSubtitle"
    />
  </AppConfirmContent>
</template>

<script setup>
import AppConfirmContent from "~/components/shared/app-confirm-content/index.vue";
import AppSwapPreview from "~/components/shared/app-swap-preview/index.vue";
import { formatMoney } from "~/utils/format";

const props = defineProps({
  sale: { type: Object, default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  exchangeQuantity: { type: Number, default: 1 },
});

const fromSubtitle = computed(
  () => `${props.sale?.unitPriceLabel || "—"} × ${props.exchangeQuantity}`,
);

const toSubtitle = computed(() => {
  if (!props.selectedNewProduct) return "—";
  return `${formatMoney(props.selectedNewProduct.unitPrice)} × ${props.exchangeQuantity}`;
});

const noticeClass = computed(() => [
  "rounded-lg border px-3 py-2 text-slate-200",
  props.priceComparison?.boxClass,
]);
</script>
