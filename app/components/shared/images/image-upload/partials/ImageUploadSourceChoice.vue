<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
    <button
      type="button"
      class="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center transition hover:border-primary/60 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-primary/50 dark:hover:bg-primary/10"
      data-testid="payment-proof-from-camera"
      aria-label="فتح الكاميرا لالتقاط صورة الإثبات"
      @click="$emit('pick-camera')"
    >
      <span
        class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary-700 dark:text-primary-200"
      >
        <i class="pi pi-camera text-base" aria-hidden="true" />
      </span>
      <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">
        فتح الكاميرا
      </span>
      <span class="text-xs text-slate-500 dark:text-slate-400">التقاط صورة</span>
    </button>

    <button
      type="button"
      class="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center transition hover:border-primary/60 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-primary/50 dark:hover:bg-primary/10"
      data-testid="payment-proof-from-device"
      aria-label="رفع صورة الإثبات من الجهاز"
      @click="$emit('pick-device')"
    >
      <span
        class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100"
      >
        <i class="pi pi-upload text-base" aria-hidden="true" />
      </span>
      <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">
        رفع صورة
      </span>
      <span class="text-xs text-slate-500 dark:text-slate-400">اختيار من الجهاز</span>
    </button>
  </div>
</template>

<script setup>
defineOptions({ name: "ImageUploadSourceChoice" });

defineProps({
  maxSizeLabel: { type: String, default: "" },
});

defineEmits(["pick-device", "pick-camera"]);
</script>
