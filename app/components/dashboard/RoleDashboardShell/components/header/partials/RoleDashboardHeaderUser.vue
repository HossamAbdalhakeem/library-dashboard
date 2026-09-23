<template>
  <div
    class="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111111] px-2 py-1.5 shadow-sm sm:gap-3 sm:px-3 sm:py-2"
  >
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white sm:h-10 sm:w-10"
    >
      {{ userInitials }}
    </div>
    <div class="hidden text-right sm:block">
      <p
        class="max-w-[9rem] truncate text-sm font-semibold text-white sm:max-w-none"
      >
        {{ userName }}
      </p>
      <p
        class="max-w-[9rem] truncate text-xs text-neutral-400 sm:max-w-none"
      >
        {{ contextLabel || roleLabel }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "RoleDashboardHeaderUser" });

defineProps({
  userInitials: { type: String, default: "" },
  userName: { type: String, default: "" },
  roleLabel: { type: String, default: "" },
  contextLabel: { type: String, default: "" },
});
</script>
