<template>
  <div
    class="grid gap-4"
    :class="showImage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'"
    dir="rtl"
  >
    <PaymentMethods
      :model-value="method"
      :label="methodLabel"
      :options="options"
      :exclude="exclude"
      :invalid="methodInvalid"
      :error-message="methodError"
      @update:model-value="onMethodChange"
    />

    <div v-if="showImage" class="flex h-full flex-col gap-2 text-right">
      <ImageUpload
        :model-value="image"
        :label="imageLabel"
        :placeholder="imagePlaceholder"
        :max-size-bytes="maxSizeBytes"
        :invalid="imageInvalid || Boolean(imageError)"
        :upload-handler="onImageSelect"
        @update:model-value="onImageFileChange"
        @clear="onImageClear"
        @error="onImageError"
      />
      <p v-if="uploading" class="text-xs text-primary-600">جاري رفع صورة الإثبات...</p>
      <p v-if="imageError" class="text-xs text-red-500">{{ imageError }}</p>
      <p
        v-else-if="imageKey && !uploading"
        class="truncate text-xs text-emerald-600"
        :title="imageKey"
      >
        تم رفع الصورة بنجاح
      </p>
    </div>
  </div>
</template>

<script setup>
import PaymentMethods from "~/components/shared/payment-methods/index.vue";
import { paymentService } from "~/services/paymentService";
import {
  PaymentMethod,
  normalizePaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";

const ImageUpload = defineAsyncComponent(() =>
  import("~/components/shared/image-upload/index.vue"),
);

defineOptions({ name: "PaymentFields" });

const props = defineProps({
  method: { type: String, default: PaymentMethod.CASH },
  image: { type: [Object, File, null], default: null },
  /**
   * Permanent storage object key (Payment.proofReference).
   * Kept as imageDataUrl prop name for backward-compatible v-model binding.
   */
  imageDataUrl: { type: String, default: "" },
  /** Temporary signed URL for immediate preview (optional) */
  imagePreviewUrl: { type: String, default: "" },
  methodLabel: { type: String, default: "طريقة الدفع" },
  imageLabel: { type: String, default: "صورة إثبات الدفع" },
  imagePlaceholder: { type: String, default: "ارفع صورة المحفظة / إنستاباي" },
  options: { type: Array, default: null },
  exclude: { type: Array, default: () => [] },
  showImageWhen: {
    type: String,
    default: "non-cash",
    validator: (value) => ["non-cash", "always", "never"].includes(value),
  },
  requireImageWhen: {
    type: String,
    default: "non-cash",
    validator: (value) => ["non-cash", "always", "never"].includes(value),
  },
  methodInvalid: { type: Boolean, default: false },
  methodError: { type: String, default: "" },
  imageInvalid: { type: Boolean, default: false },
  imageRequiredMessage: {
    type: String,
    default: "صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.",
  },
});

const emit = defineEmits([
  "update:method",
  "update:image",
  "update:imageDataUrl",
  "update:imagePreviewUrl",
  "change",
]);

const runtimeConfig = useRuntimeConfig();
const maxSizeBytes = computed(() =>
  Number(runtimeConfig.public.paymentScreenshotMaxBytes),
);

const internalImageError = ref("");
const uploading = ref(false);

/** Permanent object key stored on the payment */
const imageKey = computed(() => props.imageDataUrl);

const normalizedMethod = computed(() =>
  normalizePaymentMethod(props.method),
);

const isNonCash = computed(() => paymentMethodNeedsProof(normalizedMethod.value));

const showImage = computed(() => {
  if (props.showImageWhen === "always") return true;
  if (props.showImageWhen === "never") return false;
  return isNonCash.value;
});

const imageRequired = computed(() => {
  if (props.requireImageWhen === "always") return true;
  if (props.requireImageWhen === "never") return false;
  return isNonCash.value;
});

const imageError = computed(() => {
  if (internalImageError.value) return internalImageError.value;
  if (props.imageInvalid && imageRequired.value) {
    return props.imageRequiredMessage;
  }
  return "";
});

const emitChange = (next = {}) => {
  emit("change", {
    method: next.method ?? normalizedMethod.value,
    image: next.image === undefined ? props.image : next.image,
    imageDataUrl:
      next.imageDataUrl === undefined ? props.imageDataUrl : next.imageDataUrl,
    imagePreviewUrl:
      next.imagePreviewUrl === undefined
        ? props.imagePreviewUrl
        : next.imagePreviewUrl,
    key: next.imageDataUrl === undefined ? props.imageDataUrl : next.imageDataUrl,
  });
};

const clearImage = () => {
  internalImageError.value = "";
  uploading.value = false;
  emit("update:image", null);
  emit("update:imageDataUrl", "");
  emit("update:imagePreviewUrl", "");
  emitChange({ image: null, imageDataUrl: "", imagePreviewUrl: "" });
};

const onMethodChange = (value) => {
  const method = normalizePaymentMethod(value);
  emit("update:method", method);

  const keepsImage =
    props.showImageWhen === "always" || paymentMethodNeedsProof(method);

  if (!keepsImage && (props.image || props.imageDataUrl)) {
    emit("update:image", null);
    emit("update:imageDataUrl", "");
    emit("update:imagePreviewUrl", "");
    emitChange({
      method,
      image: null,
      imageDataUrl: "",
      imagePreviewUrl: "",
    });
    return;
  }

  emitChange({ method });
};

const onImageFileChange = (file) => {
  emit("update:image", file);
  if (!file) {
    emit("update:imageDataUrl", "");
    emit("update:imagePreviewUrl", "");
    emitChange({ image: null, imageDataUrl: "", imagePreviewUrl: "" });
  }
};

const onImageSelect = async (file) => {
  internalImageError.value = "";
  emit("update:image", file);
  emit("update:imageDataUrl", "");
  emit("update:imagePreviewUrl", "");
  uploading.value = true;

  try {
    const uploaded = await paymentService.uploadPaymentProof(file);
    // Store permanent key on imageDataUrl (used as proofReference)
    emit("update:imageDataUrl", uploaded.key);
    emit("update:imagePreviewUrl", uploaded.file_url);
    emitChange({
      image: file,
      imageDataUrl: uploaded.key,
      imagePreviewUrl: uploaded.file_url,
    });
  } catch (error) {
    internalImageError.value =
      error?.message || "تعذر رفع صورة الإثبات. حاول مرة أخرى.";
    emit("update:image", null);
    emit("update:imageDataUrl", "");
    emit("update:imagePreviewUrl", "");
    emitChange({ image: null, imageDataUrl: "", imagePreviewUrl: "" });
    throw error;
  } finally {
    uploading.value = false;
  }
};

const onImageClear = () => {
  clearImage();
};

const onImageError = (message) => {
  internalImageError.value = message || "تعذر رفع صورة الإثبات.";
};

const validate = () => {
  if (!imageRequired.value) return true;
  if (uploading.value) {
    internalImageError.value = "انتظر حتى يكتمل رفع صورة الإثبات.";
    return false;
  }
  if (props.imageDataUrl) return true;
  internalImageError.value = props.imageRequiredMessage;
  return false;
};

const reset = () => {
  internalImageError.value = "";
  uploading.value = false;
  emit("update:image", null);
  emit("update:imageDataUrl", "");
  emit("update:imagePreviewUrl", "");
};

defineExpose({ validate, reset, showImage, imageRequired, uploading });
</script>
