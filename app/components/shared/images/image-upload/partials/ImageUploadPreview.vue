<template>
  <div class="flex flex-col gap-3">
    <div
      class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
    >
      <img
        :src="previewUrl"
        alt="إثبات الدفع"
        class="aspect-video w-full object-contain"
      />
      <button
        type="button"
        class="absolute end-2 top-2 flex size-8 items-center justify-center rounded-full bg-slate-900/80 text-white transition-colors hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="إزالة صورة الإثبات"
        @click="$emit('clear')"
      >
        <PaymentIcon name="x" class="size-3.5" />
      </button>
    </div>

    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
          لقطة إثبات الدفع
        </p>
        <p
          v-if="fileMeta"
          class="truncate text-xs text-slate-500 dark:text-slate-400"
        >
          {{ fileMeta }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <button type="button" class="iu-link" @click="$emit('crop')">
          قص
        </button>
        <button
          type="button"
          class="iu-link inline-flex items-center gap-1.5"
          aria-label="تغيير الصورة"
          @click="$emit('change')"
        >
          <PaymentIcon name="upload" class="size-3.5" />
          تغيير الصورة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import PaymentIcon from "~/components/shared/payment/payment-icon/index.vue";

defineOptions({ name: "ImageUploadPreview" });

defineProps({
  previewUrl: { type: String, required: true },
  fileMeta: { type: String, default: "" },
  aspectRatio: { type: Number, default: NaN },
});

defineEmits(["crop", "change", "clear"]);
</script>

<style scoped>
.iu-link {
  border: 0;
  background: transparent;
  padding: 0;
  color: #bc7d2c;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.375rem;
}

.iu-link:focus-visible {
  outline: 2px solid rgb(245 175 82 / 0.7);
  outline-offset: 2px;
}

:global(.app-dark) .iu-link {
  color: #f9ddb2;
}
</style>
