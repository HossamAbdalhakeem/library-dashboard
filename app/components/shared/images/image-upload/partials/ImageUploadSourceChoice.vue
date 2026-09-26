<template>
  <div class="p-3 sm:p-4">
    <div class="mb-3 text-center">
      <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">
        إضافة صورة الإثبات
      </p>
      <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        اختر طريقة رفع الصورة — صور فقط · الحد {{ maxSizeLabel }}
      </p>
    </div>

    <div class="grid gap-2.5 sm:grid-cols-2">
      <button
        type="button"
        class="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-3 py-5 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-primary-400/50"
        data-testid="payment-proof-from-device"
        @click="$emit('pick-device')"
      >
        <span
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 transition group-hover:bg-primary-500 group-hover:text-white dark:text-primary-300"
        >
          <i class="pi pi-images text-xl" />
        </span>
        <span class="text-sm font-semibold">من الجهاز</span>
        <span
          class="text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500"
        >
          اختر صورة محفوظة من المعرض أو الملفات
        </span>
      </button>

      <button
        type="button"
        class="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-3 py-5 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-emerald-400/50"
        data-testid="payment-proof-from-camera"
        @click="$emit('pick-camera')"
      >
        <span
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white dark:text-emerald-300"
        >
          <i class="pi pi-camera text-xl" />
        </span>
        <span class="text-sm font-semibold">الكاميرا</span>
        <span
          class="text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500"
        >
          التقاط صورة مباشرة ثم قصها ورفعها
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "ImageUploadSourceChoice" });

defineProps({
  maxSizeLabel: { type: String, required: true },
});

defineEmits(["pick-device", "pick-camera"]);
</script>
