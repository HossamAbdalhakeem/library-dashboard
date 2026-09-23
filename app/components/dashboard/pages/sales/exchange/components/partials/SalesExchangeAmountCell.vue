<template>
  <span
    class="inline-flex rounded-md bg-orange-500/20 px-2 py-1 text-xs font-bold tabular-nums text-orange-300 ring-1 ring-inset ring-orange-400/40"
  >
    {{ label || "—" }}
  </span>
</template>

<script setup>
defineOptions({ name: "SalesExchangeAmountCell" });

defineProps({
  label: { type: String, default: "" },
});
</script>
