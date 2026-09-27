<template>
  <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/[0.04]">
    <img
      :src="previewUrl"
      alt="معاينة الصورة"
      class="h-16 w-16 shrink-0 rounded-lg object-cover"
    />

    <div class="min-w-0 flex-1">
      <p
        v-if="fileMeta"
        class="truncate text-xs text-slate-500 dark:text-slate-400"
      >
        {{ fileMeta }}
      </p>
      <div class="mt-1.5 flex flex-wrap gap-1.5">
        <button type="button" class="iu-action" @click="$emit('crop')">
          <i class="pi pi-crop" />
          قص
        </button>
        <button type="button" class="iu-action" @click="$emit('change')">
          <i class="pi pi-refresh" />
          تغيير
        </button>
        <button
          type="button"
          class="iu-action iu-action--danger"
          @click="$emit('clear')"
        >
          <i class="pi pi-trash" />
          إزالة
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
.iu-action {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgb(226 232 240);
  background: white;
  color: rgb(51 65 85);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.iu-action--danger {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242);
  color: rgb(185 28 28);
}

:global(.app-dark) .iu-action {
  border-color: rgb(255 255 255 / 0.12);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

:global(.app-dark) .iu-action--danger {
  border-color: rgb(248 113 113 / 0.4);
  background: rgb(127 29 29 / 0.35);
  color: rgb(254 202 202);
}
</style>
