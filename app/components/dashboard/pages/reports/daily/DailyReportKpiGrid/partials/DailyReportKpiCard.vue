<template>
  <button
    type="button"
    class="group relative overflow-hidden rounded-2xl border p-4 text-right transition"
    :class="[
      borderClass,
      clickable
        ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
        : 'cursor-default opacity-95',
    ]"
    :disabled="!clickable"
    @click="clickable && $emit('select')"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
      :class="glowClass"
    />
    <div class="relative flex items-start justify-between gap-3">
      <div>
        <p class="text-sm text-slate-300">{{ label }}</p>
        <p class="mt-2 text-2xl font-extrabold text-white">{{ value }}</p>
        <p v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
      </div>
      <span
        class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        :class="iconWrapClass"
      >
        <i :class="['pi text-base', icon]" />
      </span>
    </div>
    <div
      v-if="clickable"
      class="relative mt-3 flex items-center gap-1 text-xs text-slate-500 transition group-hover:text-slate-300"
    >
      <span>عرض التفاصيل</span>
      <i class="pi pi-angle-left text-[10px]" />
    </div>
  </button>
</template>

<script setup>
defineOptions({ name: "DailyReportKpiCard" });

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  hint: { type: String, default: "" },
  icon: { type: String, default: "pi-chart-bar" },
  clickable: { type: Boolean, default: false },
  borderClass: { type: String, default: "border-white/10 bg-slate-900" },
  iconWrapClass: { type: String, default: "bg-slate-700/50 text-slate-300" },
  glowClass: { type: String, default: "" },
});

defineEmits(["select"]);
</script>
