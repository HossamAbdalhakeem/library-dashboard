<template>
  <div
    class="flex items-center justify-between gap-2"
    :class="bordered ? borderClass : ''"
  >
    <span :class="labelClass">{{ label }}</span>
    <span :class="valueClass">
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>

<script setup>
defineOptions({ name: "ExchangeReservationDetailRow" });

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "" },
  bordered: { type: Boolean, default: false },
  borderClass: { type: String, default: "border-t border-white/10 pt-1" },
  labelClass: { type: String, default: "text-slate-400" },
  valueClass: { type: String, default: "font-semibold text-slate-100" },
});
</script>
