<template>
  <div
    class="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5"
  >
    <div class="flex min-w-0 items-center gap-3">
      <div class="shrink-0 overflow-hidden rounded-xl bg-white p-1.5">
        <img
          src="/library-logo.jpeg"
          alt="بكالوريا وثانوية أونلاين"
          class="h-11 w-auto object-contain"
          width="44"
          height="44"
        />
      </div>
      <div class="min-w-0">
        <p class="truncate text-xs tracking-[0.18em] text-primary-700/80 dark:text-primary-200/80">
          بكالوريا وثانوية
        </p>
        <h2 class="mt-0.5 truncate text-base font-bold text-[var(--app-text-strong)] sm:text-lg">
          لوحة التحكم
        </h2>
      </div>
    </div>
    <button
      type="button"
      class="shrink-0 rounded-lg p-2 text-[var(--app-muted-soft)] hover:bg-[var(--app-overlay-hover)] lg:hidden"
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
