<template>
  <div class="rounded-xl px-2.5 py-2.5" :class="toneClasses.bg">
    <p class="text-[11px] text-slate-500">{{ label }}</p>
    <p class="mt-1 text-lg font-bold" :class="toneClasses.text">
      {{ Number(value || 0) }}
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: "DailyReportBranchStatCard" });

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  /** emerald | amber | rose | sky | indigo */
  tone: { type: String, default: "sky" },
});

const TONE_MAP = {
  emerald: {
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-400",
  },
  amber: {
    bg: "bg-amber-500/[0.06]",
    text: "text-amber-400",
  },
  rose: {
    bg: "bg-rose-500/[0.06]",
    text: "text-rose-400",
  },
  sky: {
    bg: "bg-primary-500/[0.06]",
    text: "text-primary-400",
  },
  indigo: {
    bg: "bg-indigo-500/[0.06]",
    text: "text-indigo-400",
  },
};

const toneClasses = computed(
  () => TONE_MAP[props.tone] || TONE_MAP.sky,
);
</script>
