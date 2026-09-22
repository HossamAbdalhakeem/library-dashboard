<template>
  <header
    class="border-b border-white/10 bg-black/90 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-5"
  >
    <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          class="rounded-xl border border-white/10 bg-[#111111] p-2.5 text-slate-200 hover:bg-white/5 lg:hidden"
          aria-label="فتح القائمة"
          @click="$emit('open-mobile')"
        >
          ☰
        </button>
        <div class="min-w-0">
          <!-- <p class="truncate text-xs text-slate-400 sm:text-sm">{{ title }}</p> -->
          <h1 class="mt-0.5 truncate text-lg font-bold text-slate-400  sm:text-2xl">
            {{ title }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <NotificationBell v-if="normalizedRole !== 'social'" />
        <div
          class="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111111] px-2 py-1.5 shadow-sm sm:gap-3 sm:px-3 sm:py-2"
        >
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white sm:h-10 sm:w-10"
          >
            {{ userInitials }}
          </div>
          <div class="hidden text-right sm:block">
            <p class="max-w-[9rem] truncate text-sm font-semibold text-white sm:max-w-none">
              {{ userName }}
            </p>
            <p class="max-w-[9rem] truncate text-xs text-neutral-400 sm:max-w-none">
              {{ contextLabel || roleLabel }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const NotificationBell = defineAsyncComponent(() =>
  import("~/components/dashboard/NotificationBell.vue"),
);

defineProps({
  title: { type: String, default: "لوحة التحكم" },
  subtitle: { type: String, default: "نظرة عامة" },
  normalizedRole: { type: String, default: "admin" },
  userInitials: { type: String, default: "" },
  userName: { type: String, default: "" },
  roleLabel: { type: String, default: "" },
  contextLabel: { type: String, default: "" },
});

defineEmits(["open-mobile"]);
</script>
