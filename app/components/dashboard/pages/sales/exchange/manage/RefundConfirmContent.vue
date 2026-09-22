<template>
  <AppConfirmContent
    warning="لا يمكن التراجع عن هذا الإجراء بعد التأكيد."
    :details="confirmDetails"
  >
    <template #message>
      <p>
        هل أنت متأكد من استرداد
        <span class="font-bold text-slate-900">
          {{ sale?.product?.name }}
        </span>
        من العملية
        <span class="font-bold text-slate-900">
          {{ sale?.saleNumber }}
        </span>
        ؟
      </p>
    </template>
  </AppConfirmContent>
</template>

<script setup>
import AppConfirmContent from "~/components/shared/app-confirm-content/index.vue";

const props = defineProps({
  sale: { type: Object, default: null },
  refundQuantity: { type: Number, default: 1 },
  refundAmountLabel: { type: String, default: "-" },
  refundMethodLabel: { type: String, default: "-" },
});

const confirmDetails = computed(() => [
  {
    key: "quantity",
    label: "الكمية",
    value: `${props.refundQuantity} من أصل ${props.sale?.quantity?.remaining ?? "—"}`,
  },
  {
    key: "refund",
    label: "الاسترداد",
    value: `${props.refundAmountLabel} عبر ${props.refundMethodLabel}`,
    valueClass: "font-semibold text-emerald-700",
  },
]);
</script>
