<template>
  <article
    class="min-w-0 overflow-hidden rounded-2xl border bg-slate-950/70 p-3.5 backdrop-blur-sm"
    :class="accentMeta.border"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="truncate text-xs text-slate-400">{{ label }}</p>
        <p
          class="mt-1.5 break-words text-xl font-extrabold tracking-tight"
          :class="accentMeta.value"
        >
          {{ value }}
        </p>
        <p v-if="hint" class="mt-1 text-xs leading-snug text-slate-500">
          {{ hint }}
        </p>
      </div>
      <span
        v-if="icon"
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        :class="accentMeta.icon"
      >
        <i :class="['pi text-sm', icon]" />
      </span>
    </div>

    <ul
      v-if="rows.length"
      class="mt-3 space-y-2 border-t border-white/10 pt-2.5"
    >
      <li
        v-for="row in rows"
        :key="row.label"
        class="flex items-start justify-between gap-3 text-sm"
      >
        <span class="min-w-0">
          <span class="text-slate-400">{{ row.label }}</span>
          <span
            v-if="row.hint"
            class="mt-0.5 block text-xs leading-snug text-slate-500"
          >
            {{ row.hint }}
          </span>
        </span>
        <span class="shrink-0 font-semibold text-[var(--app-text-strong)]">
          {{ row.value }}
        </span>
      </li>
    </ul>
  </article>
</template>

<script setup>
defineOptions({ name: "ReportsPairedMetricCard" });

const ACCENTS = {
  emerald: {
    border: "border-emerald-500/15",
    value: "text-emerald-300",
    icon: "bg-emerald-500/15 text-emerald-300",
  },
  sky: {
    border: "border-primary-500/15",
    value: "text-primary-300",
    icon: "bg-primary-500/15 text-primary-300",
  },
  amber: {
    border: "border-amber-500/15",
    value: "text-amber-300",
    icon: "bg-amber-500/15 text-amber-300",
  },
  rose: {
    border: "border-rose-500/15",
    value: "text-rose-300",
    icon: "bg-rose-500/15 text-rose-300",
  },
  slate: {
    border: "border-white/10",
    value: "text-[var(--app-text-strong)]",
    icon: "bg-white/5 text-slate-300",
  },
};

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: "" },
  icon: { type: String, default: "" },
  hint: { type: String, default: "" },
  accent: {
    type: String,
    default: "slate",
    validator: (value) =>
      ["emerald", "sky", "amber", "rose", "slate"].includes(value),
  },
  rows: { type: Array, default: () => [] },
});

const accentMeta = computed(() => ACCENTS[props.accent] || ACCENTS.slate);
</script>
