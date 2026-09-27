<template>
  <div class="flex flex-col gap-3" dir="rtl">
    <PaymentMethods
      :model-value="method"
      :label="methodLabel"
      :hint="methodHint"
      :options="options"
      :exclude="exclude"
      :invalid="methodInvalid"
      :error-message="methodError"
      @update:model-value="onMethodChange"
    />

    <div
      v-if="showImageWhen !== 'never'"
      class="pay-fold"
      :class="{ 'is-open': showImage }"
    >
      <div class="pay-fold-body" :inert="!showImage">
        <div class="pay-fold-content">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {{ imageLabel }}
              </p>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                ارفع صورة أو لقطة لعملية الدفع.
              </p>
            </div>
            <p
              v-if="uploading"
              class="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary-700 dark:text-primary-200"
            >
              <i class="pi pi-spin pi-spinner text-[11px]" />
              جاري الرفع
            </p>
          </div>

          <ImageUpload
            class="mt-3"
            :model-value="image"
            label=""
            bare
            :error="uploading ? '' : imageError"
            :placeholder="imagePlaceholder"
            :max-size-bytes="maxSizeBytes"
            show-source-choice
            :invalid="Boolean(imageError)"
            :upload-handler="onImageSelect"
            @update:model-value="onImageFileChange"
            @clear="onImageClear"
            @error="onImageError"
          />
        </div>
      </div>
    </div>

    <div class="pay-fold" :class="{ 'is-open': showCashNote }">
      <div class="pay-fold-body">
        <div class="pay-fold-content">
          <p class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <i class="pi pi-check-circle text-primary" aria-hidden="true" />
            <span>الدفع نقداً لا يحتاج صورة إثبات.</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pay-fold {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.48s cubic-bezier(0.22, 1, 0.36, 1);
}

.pay-fold.is-open {
  grid-template-rows: 1fr;
}

.pay-fold-body {
  min-height: 0;
  overflow: hidden;
}

.pay-fold-content {
  opacity: 0;
  transform: translateY(-8px);
  transition:
    opacity 0.28s ease,
    transform 0.48s cubic-bezier(0.22, 1, 0.36, 1);
}

.pay-fold.is-open .pay-fold-content {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .pay-fold,
  .pay-fold-content {
    transition: none;
  }
}
</style>

<script setup>
import PaymentMethods from "~/components/shared/payment/payment-methods/index.vue";
import { paymentApi } from "~/services/payment";
import {
  PaymentMethod,
  normalizePaymentMethod,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";

const ImageUpload = defineAsyncComponent(() =>
  import("~/components/shared/images/image-upload/index.vue"),
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
  methodHint: { type: String, default: "اختر طريقة الدفع المناسبة." },
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
  /**
   * When true (e.g. branch employee), non-cash proof shows
   * «رفع من الجهاز» vs «فتح الكاميرا» before the crop step.
   */
  showProofSourceChoice: { type: Boolean, default: false },
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

const normalizedMethod = computed(() =>
  normalizePaymentMethod(props.method),
);

const isNonCash = computed(() => paymentMethodNeedsProof(normalizedMethod.value));

const showImage = computed(() => {
  if (props.showImageWhen === "always") return true;
  if (props.showImageWhen === "never") return false;
  return isNonCash.value;
});

const showCashNote = computed(() => !showImage.value && !isNonCash.value);

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
  internalImageError.value = "";
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
    const uploaded = await paymentApi.uploadPaymentProof(file);
    emit("update:imageDataUrl", uploaded.key);
    emit("update:imagePreviewUrl", uploaded.fileUrl);
    emitChange({
      image: file,
      imageDataUrl: uploaded.key,
      imagePreviewUrl: uploaded.fileUrl,
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
  const text = typeof message === "string" ? message : message?.message;
  internalImageError.value = text || "تعذر رفع صورة الإثبات.";
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
