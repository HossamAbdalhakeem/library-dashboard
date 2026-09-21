<template>
  <div
    class="flex min-h-[6rem] items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-500"
    dir="rtl"
  >
    {{ message }}
  </div>
</template>

<script setup>
defineOptions({ name: "ReportsSectionEmpty" });

defineProps({
  message: {
    type: String,
    default: "لا توجد بيانات خلال الفترة المحددة.",
  },
});
</script>
