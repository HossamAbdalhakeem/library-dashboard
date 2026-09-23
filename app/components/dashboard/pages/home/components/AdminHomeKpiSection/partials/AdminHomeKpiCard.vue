<template>
  <button
    type="button"
    class="group relative overflow-hidden rounded-2xl border p-4 text-right transition"
    :class="[
      resolved.borderClass,
      clickable
        ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
        : 'cursor-default opacity-95',
    ]"
    :disabled="!clickable"
    @click="clickable && $emit('select')"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
      :class="resolved.glowClass"
    />
    <div class="relative flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm text-slate-300">{{ title }}</p>
        <p class="mt-2 text-2xl font-extrabold text-white">{{ count }}</p>
        <p v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
      </div>
      <span
        class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        :class="resolved.iconWrapClass"
      >
        <i :class="['pi text-base', resolved.icon]" />
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
defineOptions({ name: "AdminHomeKpiCard" });

const TYPE_META = {
  branches: {
    icon: "pi-building",
    borderClass: "border-primary-500/25 bg-slate-900",
    iconWrapClass: "bg-primary-500/15 text-primary-300",
    glowClass: "bg-gradient-to-bl from-primary-500/10 to-transparent",
  },
  students: {
    icon: "pi-users",
    borderClass: "border-emerald-500/25 bg-slate-900",
    iconWrapClass: "bg-emerald-500/15 text-emerald-300",
    glowClass: "bg-gradient-to-bl from-emerald-500/10 to-transparent",
  },
  products: {
    icon: "pi-box",
    borderClass: "border-amber-500/25 bg-slate-900",
    iconWrapClass: "bg-amber-500/15 text-amber-300",
    glowClass: "bg-gradient-to-bl from-amber-500/10 to-transparent",
  },
  teachers: {
    icon: "pi-user",
    borderClass: "border-violet-500/25 bg-slate-900",
    iconWrapClass: "bg-violet-500/15 text-violet-300",
    glowClass: "bg-gradient-to-bl from-violet-500/10 to-transparent",
  },
};

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) =>
      ["branches", "students", "products", "teachers"].includes(value),
  },
  title: { type: String, required: true },
  count: { type: [Number, String], default: 0 },
  hint: { type: String, default: "" },
  clickable: { type: Boolean, default: true },
});

defineEmits(["select"]);

const resolved = computed(() => TYPE_META[props.type] || TYPE_META.branches);
</script>
