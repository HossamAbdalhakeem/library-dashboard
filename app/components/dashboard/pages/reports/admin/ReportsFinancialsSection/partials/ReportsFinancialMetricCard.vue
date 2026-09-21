<template>
  <div
    class="relative min-w-0 overflow-hidden rounded-2xl border bg-slate-950/70 p-3.5 backdrop-blur-sm"
    :class="[
      accentMeta.borderClass,
      emphasized ? accentMeta.emphasizeClass : '',
    ]"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="truncate text-xs text-slate-400">{{ label }}</p>
        <p
          class="mt-1.5 break-words text-xl font-extrabold tracking-tight"
          :class="valueClass || accentMeta.valueClass"
        >
          {{ value }}
        </p>
      </div>
      <span
        v-if="icon"
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        :class="accentMeta.iconWrapClass"
      >
        <i :class="['pi text-sm', icon]" />
      </span>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "ReportsFinancialMetricCard" });

const ACCENT_META = {
  emerald: {
    borderClass: "border-emerald-500/15",
    valueClass: "text-emerald-300",
    iconWrapClass: "bg-emerald-500/15 text-emerald-300",
    emphasizeClass:
      "border-emerald-400/40 shadow-[0_0_28px_-6px_rgba(52,211,153,0.45)]",
  },
  sky: {
    borderClass: "border-primary-500/15",
    valueClass: "text-primary-300",
    iconWrapClass: "bg-primary-500/15 text-primary-300",
    emphasizeClass:
      "border-primary-400/40 shadow-[0_0_28px_-6px_rgba(245, 175, 82,0.4)]",
  },
  amber: {
    borderClass: "border-amber-500/15",
    valueClass: "text-amber-300",
    iconWrapClass: "bg-amber-500/15 text-amber-300",
    emphasizeClass:
      "border-amber-400/40 shadow-[0_0_28px_-6px_rgba(251,191,36,0.4)]",
  },
  rose: {
    borderClass: "border-rose-500/15",
    valueClass: "text-rose-300",
    iconWrapClass: "bg-rose-500/15 text-rose-300",
    emphasizeClass:
      "border-rose-400/40 shadow-[0_0_28px_-6px_rgba(251,113,133,0.35)]",
  },
  slate: {
    borderClass: "border-white/10",
    valueClass: "text-white",
    iconWrapClass: "bg-white/5 text-slate-300",
    emphasizeClass: "border-white/20",
  },
};

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: "" },
  valueClass: { type: String, default: "" },
  icon: { type: String, default: "" },
  accent: {
    type: String,
    default: "slate",
    validator: (v) =>
      ["emerald", "sky", "amber", "rose", "slate"].includes(v),
  },
  emphasized: { type: Boolean, default: false },
});

const accentMeta = computed(
  () => ACCENT_META[props.accent] || ACCENT_META.slate,
);
</script>
