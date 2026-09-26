<template>
  <button
    type="button"
    class="rounded-xl border border-white/10 bg-[var(--app-card)] p-2.5 text-[var(--app-text-strong)] hover:bg-[var(--app-overlay-hover)] lg:hidden"
    aria-label="فتح القائمة"
    @click="$emit('open-mobile')"
  >
    ☰
  </button>
</template>

<script setup>
defineOptions({ name: "RoleDashboardHeaderMenuButton" });

defineEmits(["open-mobile"]);
</script>
