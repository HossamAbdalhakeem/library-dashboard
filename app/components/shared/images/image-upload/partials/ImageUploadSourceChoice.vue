<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <button
      type="button"
      class="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-4 text-center transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      data-testid="payment-proof-from-camera"
      aria-label="فتح الكاميرا لالتقاط صورة الإثبات"
      @click="$emit('pick-camera')"
    >
      <span
        class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary-700 dark:text-primary-200"
      >
        <PaymentIcon name="camera" class="size-5" />
      </span>
      <span class="text-sm font-medium text-slate-900 dark:text-slate-100">
        فتح الكاميرا
      </span>
      <span class="text-xs text-slate-500 dark:text-slate-400">التقط صورة الآن</span>
    </button>

    <button
      type="button"
      class="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-4 text-center transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      data-testid="payment-proof-from-device"
      aria-label="رفع صورة الإثبات من الجهاز"
      @click="$emit('pick-device')"
    >
      <span
        class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary-700 dark:text-primary-200"
      >
        <PaymentIcon name="upload" class="size-5" />
      </span>
      <span class="text-sm font-medium text-slate-900 dark:text-slate-100">
        رفع صورة
      </span>
      <span class="text-xs text-slate-500 dark:text-slate-400">اختر من جهازك</span>
    </button>
  </div>
</template>

<script setup>
import PaymentIcon from "~/components/shared/payment/payment-icon/index.vue";

defineOptions({ name: "ImageUploadSourceChoice" });

defineProps({
  maxSizeLabel: { type: String, default: "" },
});

defineEmits(["pick-device", "pick-camera"]);
</script>
