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
    >
      <template #panel="{ method: panelMethod }">
        <div
          v-if="showsCashNoteFor(panelMethod)"
          class="border-t border-primary/20 px-4 pb-4 pt-3"
        >
          <div
            class="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-sm text-primary-800 dark:bg-primary/10 dark:text-primary-200"
          >
            <PaymentIcon name="circle-check" class="size-4 shrink-0" />
            <span>الدفع نقداً لا يحتاج إثبات دفع.</span>
          </div>
        </div>

        <div
          v-else-if="showsProofFor(panelMethod) && panelMethod === normalizedMethod"
          class="flex flex-col gap-3 border-t border-primary/20 px-4 pb-4 pt-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {{ imageLabel }}
              </p>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                ارفع لقطة شاشة أو صورة.
              </p>
            </div>
            <p
              v-if="uploading"
              class="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary-700 dark:text-primary-200"
            >
              <span
                class="size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                aria-hidden="true"
              />
              جاري الرفع
            </p>
          </div>

          <ImageUpload
            :model-value="image"
            :preview-src="imagePreviewUrl"
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

          <PaymentFeeFields
            v-if="showFee"
            :enabled="feeEnabled"
            :amount="feeAmount"
            :error="feeError"
            @update:enabled="onFeeEnabled"
            @update:amount="onFeeAmount"
          />
        </div>
      </template>
    </PaymentMethods>
  </div>
</template>

<script setup>
import PaymentMethods from "~/components/shared/payment/payment-methods/index.vue";
import PaymentIcon from "~/components/shared/payment/payment-icon/index.vue";
import PaymentFeeFields from "~/components/shared/payment/payment-fee-fields/index.vue";
import { feeAmountError } from "~/utils/payment-fee";
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
  /** Inline fee toggle under wallet / Instapay. Off for cash and other flows. */
  showFee: { type: Boolean, default: false },
  feeEnabled: { type: Boolean, default: false },
  feeAmount: { type: Number, default: null },
});

const emit = defineEmits([
  "update:method",
  "update:image",
  "update:imageDataUrl",
  "update:imagePreviewUrl",
  "update:feeEnabled",
  "update:feeAmount",
  "change",
]);

const runtimeConfig = useRuntimeConfig();
const maxSizeBytes = computed(() =>
  Number(runtimeConfig.public.paymentScreenshotMaxBytes),
);

const internalImageError = ref("");
const feeError = ref("");
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

const showsProofFor = (panelMethod) => {
  if (!showImage.value) return false;
  if (props.showImageWhen === "always") return true;
  return paymentMethodNeedsProof(panelMethod);
};

const showsCashNoteFor = (panelMethod) =>
  showCashNote.value && panelMethod === PaymentMethod.CASH;

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

const clearFee = () => {
  feeError.value = "";
  emit("update:feeEnabled", false);
  emit("update:feeAmount", null);
};

const onFeeEnabled = (value) => {
  feeError.value = "";
  emit("update:feeEnabled", value);
  if (!value) emit("update:feeAmount", null);
};

const onFeeAmount = (value) => {
  feeError.value = "";
  emit("update:feeAmount", value);
};

const onMethodChange = (value) => {
  const method = normalizePaymentMethod(value);
  internalImageError.value = "";
  emit("update:method", method);
  if (!paymentMethodNeedsProof(method)) clearFee();

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
  feeError.value = "";
  if (props.showFee && isNonCash.value) {
    feeError.value = feeAmountError(props.feeEnabled, props.feeAmount);
    if (feeError.value) return false;
  }
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
  feeError.value = "";
  uploading.value = false;
  emit("update:feeEnabled", false);
  emit("update:feeAmount", null);
  emit("update:image", null);
  emit("update:imageDataUrl", "");
  emit("update:imagePreviewUrl", "");
};

defineExpose({ validate, reset, showImage, imageRequired, uploading });
</script>
