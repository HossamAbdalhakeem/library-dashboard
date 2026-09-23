<template>
  <div
    class="flex gap-3"
    :class="[
      stacked ? 'flex-col items-stretch' : 'items-start justify-between',
      bordered ? 'border-t pt-3' : '',
      borderClass,
    ]"
  >
    <span :class="labelClass">{{ label }}</span>
    <div :class="[stacked ? '' : 'min-w-0 text-left', valueWrapperClass]">
      <slot>
        <span :class="valueClass">{{ value }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "SaleSuccessSummaryRow" });

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "" },
  bordered: { type: Boolean, default: true },
  stacked: { type: Boolean, default: false },
  labelClass: { type: String, default: "text-xs text-slate-500" },
  valueClass: { type: String, default: "text-sm font-medium text-slate-800" },
  valueWrapperClass: { type: String, default: "" },
  borderClass: { type: String, default: "border-slate-200" },
});
</script>
