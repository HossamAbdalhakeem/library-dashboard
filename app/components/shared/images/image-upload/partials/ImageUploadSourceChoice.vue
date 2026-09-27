<template>
  <div>
    <div class="grid grid-cols-2 gap-2 lg:max-w-xl">
      <button
        type="button"
        class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 dark:bg-slate-950/70 dark:text-slate-100"
        data-testid="payment-proof-from-device"
        @click="$emit('pick-device')"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/15 text-primary-600 dark:text-primary-300"
        >
          <i class="pi pi-images text-sm" />
        </span>
        من الجهاز
      </button>

      <button
        type="button"
        class="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:bg-slate-950/70 dark:text-slate-100"
        data-testid="payment-proof-from-camera"
        @click="$emit('pick-camera')"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
        >
          <i class="pi pi-camera text-sm" />
        </span>
        الكاميرا
      </button>
    </div>
    <p class="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 lg:text-right">
      صور فقط · الحد {{ maxSizeLabel }}
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: "ImageUploadSourceChoice" });

defineProps({
  maxSizeLabel: { type: String, required: true },
});

defineEmits(["pick-device", "pick-camera"]);
</script>
