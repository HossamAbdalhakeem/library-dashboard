<template>
  <p :class="rootClass">
    <span class="text-slate-400">{{ label }}:</span>
    {{ value }}
    <slot />
  </p>
</template>

<script setup>
defineOptions({ name: "DeliverReservationDetailInfoRow" });

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "—" },
  rootClass: { type: String, default: "mt-1" },
});
</script>
