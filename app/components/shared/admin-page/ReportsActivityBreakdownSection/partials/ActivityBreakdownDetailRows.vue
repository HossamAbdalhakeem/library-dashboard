<template>
  <div class="divide-y divide-white/5">
    <div
      v-for="(row, index) in rows"
      :key="`${index}-${row.label}`"
      class="flex items-start justify-between gap-4 py-3"
    >
      <div class="min-w-0">
        <p class="text-sm text-slate-200">{{ row.label }}</p>
        <p v-if="row.hint" class="mt-0.5 text-xs text-slate-500">
          {{ row.hint }}
        </p>
      </div>
      <div class="shrink-0 text-left">
        <p class="text-sm font-bold text-white">{{ row.value }}</p>
        <p
          v-if="row.secondary != null && row.secondary !== ''"
          class="mt-0.5 text-xs text-slate-400"
        >
          {{ row.secondary }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "ActivityBreakdownDetailRows" });

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
});
</script>
