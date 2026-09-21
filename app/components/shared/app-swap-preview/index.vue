<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
      <p class="text-xs" :class="fromLabelClass">{{ fromLabel }}</p>
      <p class="mt-1 font-semibold text-white">{{ fromTitle || "—" }}</p>
      <p v-if="fromSubtitle" class="mt-0.5 text-xs text-slate-400">
        {{ fromSubtitle }}
      </p>
    </div>
    <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
      <p class="text-xs" :class="toLabelClass">{{ toLabel }}</p>
      <p class="mt-1 font-semibold text-white">{{ toTitle || "—" }}</p>
      <p v-if="toSubtitle" class="mt-0.5 text-xs text-slate-400">
        {{ toSubtitle }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AppSwapPreview" });

defineProps({
  fromLabel: { type: String, default: "من" },
  toLabel: { type: String, default: "إلى" },
  fromLabelClass: { type: String, default: "text-rose-300" },
  toLabelClass: { type: String, default: "text-emerald-300" },
  fromTitle: { type: String, default: "" },
  fromSubtitle: { type: String, default: "" },
  toTitle: { type: String, default: "" },
  toSubtitle: { type: String, default: "" },
});
</script>
