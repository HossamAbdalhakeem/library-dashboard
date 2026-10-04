<template>
  <div class="flex flex-col gap-2 text-right" dir="rtl">
    <label
      v-if="label"
      class="text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {{ label }}
    </label>

    <div
      class="transition"
      :class="
        bare
          ? ''
          : invalid || errorMessage
            ? 'overflow-hidden rounded-2xl border border-red-400/70 bg-red-500/5'
            : 'overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-white/10 dark:from-slate-900/80 dark:to-slate-950/60'
      "
    >
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        accept="image/*"
        aria-label="رفع صورة إثبات الدفع"
        @change="onFileChange"
      />
      <input
        ref="cameraInputRef"
        type="file"
        class="hidden"
        accept="image/*"
        capture="environment"
        aria-label="التقاط صورة إثبات الدفع بالكاميرا"
        @change="onFileChange"
      />

      <ImageUploadPreview
        v-if="previewUrl"
        :preview-url="previewUrl"
        :file-meta="fileMeta"
        :aspect-ratio="aspectRatio"
        @crop="openCropper"
        @change="openPicker"
        @clear="clear"
      />

      <ImageUploadSourceChoice
        v-else-if="showSourceChoice"
        :max-size-label="maxSizeLabel"
        @pick-device="openPicker"
        @pick-camera="openCamera"
      />

      <ImageUploadEmpty
        v-else
        :placeholder="placeholder"
        :max-size-label="maxSizeLabel"
        @pick="openPicker"
      />
    </div>

    <p v-if="visibleError" class="text-xs text-red-500">{{ visibleError }}</p>

    <ImageCameraCapture
      v-if="showCameraCapture"
      v-model:visible="showCameraCapture"
      @captured="onCameraCaptured"
      @error="onCameraError"
    />

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
import ImageUploadPreview from "./partials/ImageUploadPreview.vue";
import ImageUploadSourceChoice from "./partials/ImageUploadSourceChoice.vue";
import ImageUploadEmpty from "./partials/ImageUploadEmpty.vue";

defineOptions({ name: "ImageUpload" });

const ImageCropper = defineAsyncComponent(() =>
  import("~/components/shared/images/image-cropper/index.vue"),
);
const ImageCameraCapture = defineAsyncComponent(() =>
  import("~/components/shared/images/image-camera-capture/index.vue"),
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
  /** Skip the outer card so a parent panel can own the frame. */
  bare: { type: Boolean, default: false },
  /** Parent-owned message. Shown instead of the internal one so it is not repeated. */
  error: { type: String, default: "" },
  /**
   * Existing remote or signed preview. Restores the proof image when this
   * uploader remounts after switching between wallet and InstaPay.
   */
  previewSrc: { type: String, default: "" },
});

const emit = defineEmits([
  "update:modelValue",
  "select",
  "clear",
  "error",
  "cropped",
]);

const {
  inputRef,
  cameraInputRef,
  previewUrl,
  errorMessage,
  fileMeta,
  showCropper,
  cropperMounted,
  showCameraCapture,
  selectedImage,
  isProcessing,
  maxSizeLabel,
  openPicker,
  openCamera,
  clear,
  openCropper,
  onFileChange,
  onCameraCaptured,
  onCameraError,
  handleCropped,
  handleCropperError,
  handleCropperClose,
  handleUploadNew,
} = useImageUpload(props, emit);

const visibleError = computed(() => props.error || errorMessage.value || "");

defineExpose({ clear, openPicker, openCropper, openCamera });
</script>
