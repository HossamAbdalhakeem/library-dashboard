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
      :from-title="sale?.product?.name"
      :from-subtitle="fromSubtitle"
      :to-title="selectedNewProduct?.name || '—'"
      :to-subtitle="toSubtitle"
    />

    <div
      v-if="priceComparison?.kind === 'more'"
      class="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
    >
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-slate-600">{{ priceComparison.diffLabel }}</span>
        <span class="text-base font-extrabold text-slate-900">
          {{ formatMoney(differenceAmount) }}
        </span>
      </div>
      <div
        v-if="visibleFee != null"
        class="flex items-center justify-between gap-3 border-t border-slate-200 pt-2"
      >
        <span class="text-sm font-semibold text-slate-700">رسوم التحويل</span>
        <span class="text-base font-extrabold text-slate-900">
          {{ formatMoney(visibleFee) }}
        </span>
      </div>
    </div>
  </AppConfirmContent>
</template>

<script setup>
import AppConfirmContent from "~/components/shared/app-confirm-content/index.vue";
import AppSwapPreview from "~/components/shared/app-swap-preview/index.vue";
import { formatMoney } from "~/utils/format/money";
import { visibleFeeAmount } from "~/utils/payment-fee";

const props = defineProps({
  sale: { type: Object, default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  exchangeQuantity: { type: Number, default: 1 },
  feeAmount: { type: Number, default: null },
});

const fromSubtitle = computed(
  () => `${props.sale?.product?.unitPriceLabel || "—"} × ${props.exchangeQuantity}`,
);

const toSubtitle = computed(() => {
  if (!props.selectedNewProduct) return "—";
  return `${formatMoney(props.selectedNewProduct.unitPrice)} × ${props.exchangeQuantity}`;
});

const noticeClass = computed(() => [
  "rounded-lg border px-3 py-2 text-slate-200",
  props.priceComparison?.boxClass,
]);

const differenceAmount = computed(() => {
  const comparison = props.priceComparison;
  if (!comparison) return 0;
  return comparison.absoluteDifference ?? Math.abs(Number(comparison.difference || 0));
});

const visibleFee = computed(() => visibleFeeAmount(props.feeAmount));
</script>
