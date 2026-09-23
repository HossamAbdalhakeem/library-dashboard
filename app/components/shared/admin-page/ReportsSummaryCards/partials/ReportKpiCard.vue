<template>
  <div
    class="relative min-w-0 overflow-hidden rounded-2xl border bg-slate-900/80 p-4 backdrop-blur-sm"
    :class="[
      accentMeta.borderClass,
      accentMeta.shadowClass,
      compact ? 'p-3.5' : 'p-4',
    ]"
  >
    <div
      class="pointer-events-none absolute inset-y-0 start-0 w-1 rounded-s-2xl"
      :class="accentMeta.barClass"
    />
    <div class="relative flex items-start justify-between gap-2 ps-2">
      <div class="min-w-0">
        <p class="truncate text-sm text-slate-400">{{ label }}</p>
        <slot>
          <p
            class="mt-1.5 break-words font-extrabold tracking-tight"
            :class="[compact ? 'text-xl' : 'text-2xl', accentMeta.valueClass]"
          >
            {{ value }}
          </p>
          <p
            v-if="hint"
            class="mt-1 break-words text-xs leading-snug text-slate-500"
          >
            {{ hint }}
          </p>
        </slot>
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
defineOptions({ name: "ReportKpiCard" });

const ACCENT_META = {
  emerald: {
    borderClass: "border-emerald-500/20",
    barClass: "bg-emerald-400",
    shadowClass: "shadow-[0_0_24px_-8px_rgba(52,211,153,0.35)]",
    valueClass: "text-emerald-300",
    iconWrapClass: "bg-emerald-500/15 text-emerald-300",
  },
  sky: {
    borderClass: "border-primary-500/20",
    barClass: "bg-primary-400",
    shadowClass: "shadow-[0_0_24px_-8px_rgba(245, 175, 82,0.35)]",
    valueClass: "text-primary-300",
    iconWrapClass: "bg-primary-500/15 text-primary-300",
  },
  amber: {
    borderClass: "border-amber-500/20",
    barClass: "bg-amber-400",
    shadowClass: "shadow-[0_0_24px_-8px_rgba(251,191,36,0.35)]",
    valueClass: "text-amber-300",
    iconWrapClass: "bg-amber-500/15 text-amber-300",
  },
  rose: {
    borderClass: "border-rose-500/20",
    barClass: "bg-rose-400",
    shadowClass: "shadow-[0_0_24px_-8px_rgba(251,113,133,0.3)]",
    valueClass: "text-rose-300",
    iconWrapClass: "bg-rose-500/15 text-rose-300",
  },
  slate: {
    borderClass: "border-white/10",
    barClass: "bg-slate-500",
    shadowClass: "",
    valueClass: "text-white",
    iconWrapClass: "bg-white/5 text-slate-300",
  },
};

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: "" },
  hint: { type: String, default: "" },
  icon: { type: String, default: "" },
  compact: { type: Boolean, default: false },
  accent: {
    type: String,
    default: "slate",
    validator: (v) =>
      ["emerald", "sky", "amber", "rose", "slate"].includes(v),
  },
});

const accentMeta = computed(
  () => ACCENT_META[props.accent] || ACCENT_META.slate,
);
</script>
