<template>
  <div
    class="flex min-h-[8rem] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-900 p-6 text-center"
    dir="rtl"
  >
    <p class="text-sm text-slate-300">
      {{ message || "تعذر تحميل البيانات." }}
    </p>
    <Button
      v-if="showRetry"
      label="إعادة المحاولة"
      severity="secondary"
      size="small"
      @click="$emit('retry')"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";

defineOptions({ name: "ReportsSectionError" });

defineProps({
  message: { type: String, default: "" },
  showRetry: { type: Boolean, default: true },
});

defineEmits(["retry"]);
</script>
