<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h2 class="text-xl font-bold text-[var(--app-text-strong)]">
      {{ title }}
    </h2>
    <div class="flex flex-wrap items-center gap-2">
      <slot name="header-actions" />
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-muted-soft)] transition hover:bg-[var(--app-overlay-hover)]"
      >
        ← رجوع للكتب
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "BookingFormHeader" });

defineProps({
  title: { type: String, default: "حجز منتج" },
  backTo: { type: String, default: "" },
});
</script>
