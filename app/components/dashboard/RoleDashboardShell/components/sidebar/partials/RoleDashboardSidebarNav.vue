<template>
  <nav
    class="flex-1 space-y-2 overflow-y-auto px-3 py-4 pb-44 sm:px-4 sm:py-5"
    aria-label="القائمة الرئيسية"
  >
    <div
      v-for="section in navigation"
      :key="section.id"
      class="overflow-hidden rounded-xl border border-white/10 bg-[var(--app-overlay-soft)]"
    >
      <button
        v-if="section.label"
        type="button"
        class="flex w-full items-center justify-between gap-2 px-3 py-3 text-right transition hover:bg-[var(--app-overlay-hover)]"
        :aria-expanded="openSectionId === section.id"
        @click="$emit('toggle-section', section.id)"
      >
        <span class="text-xs font-bold tracking-wide text-primary-700 dark:text-primary-300">
          {{ section.label }}
        </span>
        <span
          class="text-sm text-slate-400 transition-transform duration-200"
          :class="openSectionId === section.id ? 'rotate-180' : ''"
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        v-show="!section.label || openSectionId === section.id"
        class="space-y-1 px-2 pb-2"
        :class="section.label ? 'border-t border-white/5 pt-1' : 'pt-2'"
      >
        <NuxtLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-right text-sm font-medium transition hover:bg-[var(--app-overlay-hover)]"
          :class="
            isActive(item.to)
              ? 'bg-[var(--app-elevated)] text-primary-700 ring-1 ring-primary-500/40 dark:text-primary-200'
              : 'text-[var(--app-muted-soft)]'
          "
          @click="$emit('close-mobile')"
        >
          <span>{{ item.label }}</span>
          <i :class="item.icon" class="text-base" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineOptions({ name: "RoleDashboardSidebarNav" });

defineProps({
  navigation: { type: Array, default: () => [] },
  openSectionId: { type: [String, Number], default: null },
  isActive: { type: Function, required: true },
});

defineEmits(["close-mobile", "toggle-section"]);
</script>
