<template>
  <div class="iu-preview p-3">
    <img
      :src="previewUrl"
      alt="معاينة الصورة"
      class="mx-auto max-h-44 rounded-xl object-contain shadow-sm"
      :style="aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined"
    />

    <div class="iu-hover-overlay">
      <button type="button" class="iu-hover-action" @click="$emit('crop')">
        <i class="pi pi-crop" />
        <span>قص</span>
      </button>
      <button type="button" class="iu-hover-action" @click="$emit('change')">
        <i class="pi pi-pencil" />
        <span>تغيير</span>
      </button>
      <button
        type="button"
        class="iu-hover-action iu-hover-action--danger"
        @click="$emit('clear')"
      >
        <i class="pi pi-trash" />
        <span>إزالة</span>
      </button>
    </div>

    <p
      v-if="fileMeta"
      class="mt-2 text-center text-xs text-slate-500 dark:text-slate-400"
    >
      {{ fileMeta }}
    </p>
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
.iu-preview {
  position: relative;
  display: block;
  width: 100%;
  border-radius: 0.75rem;
  overflow: hidden;
}

.iu-hover-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.iu-preview:hover .iu-hover-overlay,
.iu-preview:focus-within .iu-hover-overlay {
  display: flex;
  pointer-events: auto;
}

.iu-hover-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2937;
  border: none;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
}

.iu-hover-action--danger {
  background: rgba(220, 38, 38, 0.92);
  color: #fff;
}
</style>
