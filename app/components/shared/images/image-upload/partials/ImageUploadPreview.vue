<template>
  <div class="flex flex-col gap-2">
    <div
      class="relative aspect-[16/10] w-full max-w-lg overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
    >
      <img
        :src="previewUrl"
        alt="صورة إثبات الدفع"
        class="h-full w-full object-contain"
      />
      <button
        type="button"
        class="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/75 text-white transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="إزالة صورة الإثبات"
        @click="$emit('clear')"
      >
        <i class="pi pi-times text-xs" aria-hidden="true" />
      </button>
    </div>

    <div class="flex items-center justify-between gap-3">
      <p class="truncate text-xs text-slate-500 dark:text-slate-400">
        {{ fileMeta || "صورة إثبات الدفع" }}
      </p>
      <div class="flex shrink-0 items-center gap-2">
        <button type="button" class="iu-link" @click="$emit('crop')">
          قص
        </button>
        <button type="button" class="iu-link" aria-label="تغيير الصورة" @click="$emit('change')">
          تغيير الصورة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  color: rgb(180 83 9);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.iu-link:focus-visible {
  outline: 2px solid rgb(245 175 82 / 0.7);
  outline-offset: 2px;
  border-radius: 4px;
}

:global(.app-dark) .iu-link {
  color: rgb(252 211 77);
}
</style>
