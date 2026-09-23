<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-5" dir="rtl">
    <p class="font-bold text-white">{{ title }}</p>
    <p v-if="subtitle" class="mt-0.5 text-xs text-slate-400">{{ subtitle }}</p>

    <div
      v-if="!items.length"
      class="mt-6 flex h-40 items-center justify-center text-sm text-slate-500"
    >
      {{ emptyMessage }}
    </div>

    <ul v-else class="mt-4 space-y-1">
      <li
        v-for="(item, index) in items"
        :key="item.id || index"
        class="flex items-center justify-between gap-3 border-b border-white/[0.04] py-3 last:border-b-0"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-sm font-bold text-primary-300"
          >
            {{ index + 1 }}
          </span>
          <span class="truncate text-sm text-slate-200">{{
            item.name || "—"
          }}</span>
        </div>
        <span class="shrink-0 text-sm font-bold text-white">
          {{ Number(item.salesCount ?? 0) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminHomeTopProductsCard" });

defineProps({
  title: { type: String, default: "أكثر المنتجات مبيعًا" },
  subtitle: { type: String, default: "أعلى المنتجات خلال اليوم" },
  items: { type: Array, default: () => [] },
  emptyMessage: {
    type: String,
    default: "لا توجد مبيعات لعرضها بعد.",
  },
});
</script>
