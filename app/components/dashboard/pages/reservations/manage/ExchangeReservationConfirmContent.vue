<template>
  <AppConfirmContent
    :notice="noticeText"
    :notice-class="noticeClass"
  >
    <template #message>
      <p>
        هل أنت متأكد من استبدال منتج الحجز
        <span class="font-bold text-slate-900">
          {{ reservation?.reservationNumber }}
        </span>
        ؟
      </p>
    </template>

    <AppSwapPreview
      :from-title="reservation?.product?.name || reservation?.productName"
      :from-subtitle="fromSubtitle"
      :to-title="selectedNewProduct?.name || '—'"
      :to-subtitle="toSubtitle"
    />
  </AppConfirmContent>
</template>

<script setup>
import AppConfirmContent from "~/components/shared/app-confirm-content/index.vue";
import AppSwapPreview from "~/components/shared/app-swap-preview/index.vue";

const props = defineProps({
  reservation: { type: Object, default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
});

const fromSubtitle = computed(
  () =>
    `أ/ ${props.reservation?.product?.teacherName || props.reservation?.teacherName || "—"}`,
);

const toSubtitle = computed(() => {
  const product = props.selectedNewProduct;
  if (!product) return "—";
  const teacher = `أ/ ${product.teacherName || "—"}`;
  if (!product.priceLabel) return teacher;
  return `${teacher} · ${product.priceKindLabel} ${product.priceLabel}`;
});

const noticeText = computed(() =>
  props.priceComparison?.kind === "less"
    ? props.priceComparison?.confirmText || ""
    : "",
);

const noticeClass = computed(() => [
  "rounded-lg border px-3 py-2 text-slate-200",
  props.priceComparison?.boxClass,
]);
</script>
