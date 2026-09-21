<template>
  <div
    class="flex items-center justify-between gap-2"
    :class="bordered ? 'border-t border-slate-700 pt-3' : ''"
  >
    <span :class="labelClass">{{ label }}</span>
    <span :class="valueClass">
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>

<script setup>
defineOptions({ name: "DeliverReservationDetailAmountRow" });

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "" },
  bordered: { type: Boolean, default: false },
  labelClass: { type: String, default: "text-slate-400" },
  valueClass: { type: String, default: "font-semibold text-slate-100" },
});
</script>
