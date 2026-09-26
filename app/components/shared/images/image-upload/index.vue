<template>
  <div class="flex flex-col gap-2 text-right" dir="rtl">
    <label v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</label>

    <div
      class="rounded-xl border border-dashed px-4 py-4 transition"
      :class="invalid || errorMessage ? 'border-red-400 bg-red' : 'border-slate-300 bg-slate-50'"
    >
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        accept="image/*"
        data-testid="payment-proof-file"
        @change="onFileChange"
      />
      <input
        ref="cameraInputRef"
        type="file"
        class="hidden"
        accept="image/*"
        capture="environment"
        data-testid="payment-proof-camera"
        @change="onFileChange"
      />

      <div v-if="previewUrl" class="iu-preview space-y-3">
        <img
          :src="previewUrl"
          alt="معاينة الصورة"
          class="mx-auto max-h-40 rounded-lg object-contain"
          :style="aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined"
        />

        <div class="iu-hover-overlay">
          <button type="button" class="iu-hover-action" @click="openCropper">
            <i class="pi pi-crop" />
            <span>قص</span>
          </button>
          <button type="button" class="iu-hover-action" @click="openPicker">
            <i class="pi pi-pencil" />
            <span>تغيير</span>
          </button>
          <button
            type="button"
            class="iu-hover-action iu-hover-action--danger"
            @click="clear"
          >
            <i class="pi pi-trash" />
            <span>إزالة</span>
          </button>
        </div>

        <p v-if="fileMeta" class="text-center text-xs text-slate-500">{{ fileMeta }}</p>
      </div>

      <div
        v-else-if="showSourceChoice"
        class="grid gap-2 sm:grid-cols-2"
      >
        <button
          type="button"
          class="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-4 text-slate-700 transition hover:border-primary-300 hover:text-slate-900"
          data-testid="payment-proof-from-device"
          @click="openPicker"
        >
          <i class="pi pi-upload text-2xl" />
          <span class="text-sm font-medium">رفع من الجهاز</span>
          <span class="text-center text-xs text-slate-400">
            اختيار صورة من المعرض
          </span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-4 text-slate-700 transition hover:border-primary-300 hover:text-slate-900"
          data-testid="payment-proof-from-camera"
          @click="openCamera"
        >
          <i class="pi pi-camera text-2xl" />
          <span class="text-sm font-medium">فتح الكاميرا</span>
          <span class="text-center text-xs text-slate-400">
            التقاط صورة بالكاميرا
          </span>
        </button>
        <p class="sm:col-span-2 text-center text-xs text-slate-400">
          صور فقط — الحد الأقصى {{ maxSizeLabel }}
        </p>
      </div>

      <button
        v-else
        type="button"
        class="flex w-full flex-col items-center gap-2 py-2 text-slate-600 hover:text-slate-900"
        @click="openPicker"
      >
        <i class="pi pi-upload text-2xl" />
        <span class="text-sm font-medium">{{ placeholder }}</span>
        <span class="text-xs text-slate-400">
          صور فقط — الحد الأقصى {{ maxSizeLabel }}
        </span>
      </button>
    </div>

    <p v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</p>

    <ImageCropper
      v-if="showCropper || cropperMounted"
      v-model="showCropper"
      :image-src="selectedImage"
      :title="cropperTitle"
      :aspect-ratio="aspectRatio"
      :processing="isProcessing"
      :close-on-cropped="false"
      @cropped="handleCropped"
      @error="handleCropperError"
      @update:model-value="handleCropperClose"
      @upload-new="handleUploadNew"
    />
  </div>
</template>

<script setup>
import { useImageUpload } from "./composables/useImageUpload";

defineOptions({ name: "ImageUpload" });

const ImageCropper = defineAsyncComponent(() =>
  import("~/components/shared/images/image-cropper/index.vue"),
);

const props = defineProps({
  label: { type: String, default: "صورة إثبات الدفع" },
  placeholder: { type: String, default: "اختر صورة" },
  cropperTitle: { type: String, default: "قص الصورة" },
  aspectRatio: { type: Number, default: NaN },
  maxSizeMb: { type: Number, default: 0.5 },
  maxSizeBytes: { type: Number, default: null },
  invalid: { type: Boolean, default: false },
  modelValue: { type: [Object, File, null], default: null },
  /** Optional async upload; cropper stays open until this resolves */
  uploadHandler: { type: Function, default: null },
  /** When true, show device upload vs camera capture before crop (e.g. branch staff). */
  showSourceChoice: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "select", "clear", "error", "cropped"]);

const {
  inputRef,
  previewUrl,
  errorMessage,
  fileMeta,
  showCropper,
  cropperMounted,
  selectedImage,
  isProcessing,
  maxSizeLabel,
  openPicker,
  openCamera,
  clear,
  openCropper,
  onFileChange,
  handleCropped,
  handleCropperError,
  handleCropperClose,
  handleUploadNew,
} = useImageUpload(props, emit);

defineExpose({ clear, openPicker, openCropper });
</script>

<style scoped>
.iu-preview {
  position: relative;
  display: inline-block;
  width: 100%;
  border-radius: 0.5rem;
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
