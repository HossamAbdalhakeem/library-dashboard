<template>
  <div
    class="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5"
  >
    <div>
      <p class="text-xs tracking-[0.28em] text-primary-700/80 dark:text-primary-200/80">مكتبة</p>
      <h2 class="mt-1 text-lg font-bold text-[var(--app-text-strong)] sm:text-xl">لوحة التحكم</h2>
    </div>
    <button
      type="button"
      class="rounded-lg p-2 text-[var(--app-muted-soft)] hover:bg-[var(--app-overlay-hover)] lg:hidden"
      aria-label="إغلاق القائمة"
      @click="$emit('close-mobile')"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
defineOptions({ name: "RoleDashboardSidebarBrand" });

defineEmits(["close-mobile"]);
</script>
