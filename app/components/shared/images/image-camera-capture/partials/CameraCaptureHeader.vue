<template>
  <div
    class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3"
  >
    <div class="text-right">
      <p class="text-sm font-semibold">التقاط صورة الإثبات</p>
      <p class="text-[11px] text-slate-400">وجّه الكاميرا ثم اضغط التقاط</p>
    </div>
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
      :disabled="disabled"
      aria-label="إغلاق"
      @click="$emit('close')"
    >
      <i class="pi pi-times text-sm" />
    </button>
  </div>
</template>

<script setup>
defineOptions({ name: "CameraCaptureHeader" });

defineProps({
  disabled: { type: Boolean, default: false },
});

defineEmits(["close"]);
</script>
