<template>
  <div
    class="absolute bottom-0 left-0 right-0 space-y-3 border-t border-white/10 bg-[var(--app-surface)] p-3 sm:p-4"
  >
    <!-- Hidden for now
    <AcademicYearSwitcher />
    -->
    <button
      type="button"
      data-testid="theme-toggle-button"
      class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[var(--app-elevated)] px-3 py-3 text-sm font-medium text-[var(--app-text-strong)] transition hover:bg-[var(--app-overlay-hover)]"
      :aria-label="isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'"
      @click="toggleTheme"
    >
      <span>{{ isDark ? "الوضع الفاتح" : "الوضع الداكن" }}</span>
      <i
        :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        class="text-base text-primary-400"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      data-testid="logout-button"
      class="flex w-full items-center justify-between rounded-xl bg-red-500/10 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-500/20 dark:text-red-200"
      @click="$emit('request-logout')"
    >
      <span>تسجيل الخروج</span>
      <span>⎋</span>
    </button>
  </div>
</template>

<script setup>
defineOptions({ name: "RoleDashboardSidebarFooter" });

defineEmits(["request-logout"]);

const { isDark, toggleTheme } = useTheme();
</script>
