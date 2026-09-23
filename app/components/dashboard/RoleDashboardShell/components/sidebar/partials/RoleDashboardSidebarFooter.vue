<template>
  <div
    class="absolute bottom-0 left-0 right-0 space-y-3 border-t border-white/10 bg-[#0a0a0a] p-3 sm:p-4"
  >
    <!-- Hidden for now
    <AcademicYearSwitcher />
    -->
    <button
      type="button"
      data-testid="logout-button"
      class="flex w-full items-center justify-between rounded-xl bg-red-500/10 px-3 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20"
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
</script>
