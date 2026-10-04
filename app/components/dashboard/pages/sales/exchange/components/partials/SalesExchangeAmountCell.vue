<template>
  <span
    class="inline-flex rounded-md px-2 py-1 text-xs font-bold tabular-nums ring-1 ring-inset"
    :class="toneClass"
  >
    {{ label || "—" }}
  </span>
</template>

<script setup>
defineOptions({ name: "SalesExchangeAmountCell" });

const props = defineProps({
  label: { type: String, default: "" },
  /** `total` orange, `paid` emerald, `fee` sky — same chips as payment cells. */
  tone: { type: String, default: "total" },
});

const toneClass = computed(() => {
  if (props.tone === "paid") {
    return "bg-emerald-500/20 text-emerald-300 ring-emerald-400/40";
  }
  if (props.tone === "fee") {
    return "bg-sky-500/20 text-sky-300 ring-sky-400/40";
  }
  return "bg-orange-500/20 text-orange-300 ring-orange-400/40";
});
</script>
