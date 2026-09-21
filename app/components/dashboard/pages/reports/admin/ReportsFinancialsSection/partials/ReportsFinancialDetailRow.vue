<template>
  <p class="min-w-0 break-words">
    {{ label }}:
    <strong :class="valueClass">{{ value }}</strong>
    <span v-if="hint" class="text-xs text-slate-500">
      {{ hint }}
    </span>
  </p>
</template>

<script setup>
defineOptions({ name: "ReportsFinancialDetailRow" });

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: "" },
  valueClass: { type: String, default: "text-white" },
  hint: { type: String, default: "" },
});
</script>
