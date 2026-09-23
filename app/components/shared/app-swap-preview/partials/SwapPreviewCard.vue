<template>
  <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
    <p class="text-xs" :class="labelClass">{{ label }}</p>
    <p class="mt-1 font-semibold text-white">{{ title || "—" }}</p>
    <p v-if="subtitle" class="mt-0.5 text-xs text-slate-400">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: "SwapPreviewCard" });

defineProps({
  label: { type: String, default: "" },
  labelClass: { type: String, default: "" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
});
</script>
