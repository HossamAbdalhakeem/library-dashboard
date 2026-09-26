<template>
  <button
    type="button"
    data-testid="theme-toggle-button"
    class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[var(--app-card)] text-[var(--app-text-strong)] transition hover:bg-[var(--app-overlay-hover)]"
    :aria-label="isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'"
    :title="isDark ? 'الوضع الفاتح' : 'الوضع الداكن'"
    @click="toggleTheme"
  >
    <i
      :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"
      class="text-base text-primary-400"
      aria-hidden="true"
    />
  </button>
</template>

<script setup>
defineOptions({ name: "RoleDashboardHeaderThemeToggle" });

const { isDark, toggleTheme } = useTheme();
</script>
