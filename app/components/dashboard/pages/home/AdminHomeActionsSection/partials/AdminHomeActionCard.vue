<template>
  <button
    type="button"
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-950/50 p-5 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-slate-900/70"
    @click="$emit('select')"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
      :class="accentLineClass"
    />

    <div
      class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
      :class="iconWrapClass"
    >
      <i :class="['pi text-lg', icon]" />
    </div>

    <p class="text-base font-bold text-white">{{ title }}</p>
    <p class="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">
      {{ description }}
    </p>

    <span
      class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition"
      :class="buttonClass"
    >
      {{ actionLabel }}
      <i class="pi pi-arrow-left text-xs opacity-80 transition group-hover:-translate-x-0.5" />
    </span>
  </button>
</template>

<script setup>
defineOptions({ name: "AdminHomeActionCard" });

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  actionLabel: { type: String, default: "فتح" },
  icon: { type: String, default: "pi-bolt" },
  iconWrapClass: {
    type: String,
    default: "bg-primary-500/15 text-primary-300",
  },
  buttonClass: {
    type: String,
    default: "bg-primary-600 hover:bg-primary-500",
  },
  accentLineClass: {
    type: String,
    default: "bg-gradient-to-l from-transparent via-primary-400/60 to-transparent",
  },
});

defineEmits(["select"]);
</script>
