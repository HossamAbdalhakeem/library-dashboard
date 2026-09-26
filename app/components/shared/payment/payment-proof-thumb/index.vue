<template>
  <div class="inline-flex items-center justify-center gap-2">
    <span v-if="showLabel" class="text-sm">{{ resolvedMethodLabel }}</span>

    <button
      v-if="canShowProof"
      type="button"
      class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-slate-800 text-slate-300 transition hover:border-primary-400/50 hover:text-primary-300 hover:ring-2 hover:ring-primary-400/30 disabled:opacity-60"
      :title="'عرض إثبات الدفع'"
      :disabled="loading"
      @click.stop="openPreview"
    >
      <i
        :class="[
          'pi text-sm',
          loading ? 'pi-spin pi-spinner' : 'pi-camera',
        ]"
      />
    </button>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      dir="rtl"
      header="إثبات الدفع"
      :style="{ width: '520px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <div class="flex flex-col items-center gap-3">
        <p v-if="resolvedMethodLabel" class="text-sm text-slate-400">
          {{ resolvedMethodLabel }}
        </p>
        <div
          class="flex min-h-64 w-full flex-col items-center justify-center gap-3"
        >
          <template v-if="loading && !resolvedUrl">
            <Skeleton width="100%" height="16rem" border-radius="12px" />
            <Skeleton width="40%" height="0.75rem" border-radius="4px" />
          </template>
          <img
            v-else-if="resolvedUrl"
            :src="resolvedUrl"
            alt="إثبات الدفع"
            class="min-h-64 max-h-[70vh] w-full rounded-xl object-contain"
          />
          <p v-else class="text-sm text-rose-400">
            {{ errorMessage || "تعذر عرض صورة الإثبات." }}
          </p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Skeleton from "primevue/skeleton";
import { paymentApi } from "~/services/payment";
import {
  getPaymentMethodLabel,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";

defineOptions({ name: "PaymentProofThumb" });

const props = defineProps({
  /** Payment method enum (CASH / WALLET / INSTAPAY) */
  method: { type: String, default: "" },
  /** Arabic or display label — optional override */
  methodLabel: { type: String, default: "" },
  /**
   * Optional local/upload preview URL (e.g. right after upload).
   * Prefer paymentId/refundId so lists never depend on pre-signed URLs.
   */
  proofUrl: { type: String, default: "" },
  /** Payment UUID — fetches signed URL on click */
  paymentId: { type: [String, Number], default: null },
  /** Refund UUID — fetches signed URL on click (refund proofs) */
  refundId: { type: [String, Number], default: null },
  /** Explicit flag from API */
  hasProof: { type: Boolean, default: null },
  /** Show method text next to the thumbnail */
  showLabel: { type: Boolean, default: true },
});

const loading = ref(false);
const dialogVisible = ref(false);
const resolvedUrl = ref("");
const errorMessage = ref("");
const fetchedKey = ref(null);

const resolvedMethodLabel = computed(
  () => props.methodLabel || getPaymentMethodLabel(props.method),
);

const isNonCash = computed(() => paymentMethodNeedsProof(props.method));

const resourceKey = computed(() => {
  if (props.paymentId) return `payment:${props.paymentId}`;
  if (props.refundId) return `refund:${props.refundId}`;
  return null;
});

const canShowProof = computed(() => {
  if (props.hasProof === true) return true;
  if (props.hasProof === false) return false;
  return (
    isNonCash.value &&
    Boolean(props.proofUrl || props.paymentId || props.refundId)
  );
});

const ensureUrl = async () => {
  if (resolvedUrl.value) return resolvedUrl.value;

  if (props.proofUrl) {
    resolvedUrl.value = props.proofUrl;
    return resolvedUrl.value;
  }

  if (resourceKey.value && fetchedKey.value === resourceKey.value && resolvedUrl.value) {
    return resolvedUrl.value;
  }

  if (!props.paymentId && !props.refundId) return "";

  loading.value = true;
  errorMessage.value = "";
  try {
    const result = props.paymentId
      ? await paymentApi.getPaymentScreenshot(String(props.paymentId))
      : await paymentApi.getRefundScreenshot(String(props.refundId));
    const url = result?.fileUrl || "";
    resolvedUrl.value = url;
    fetchedKey.value = resourceKey.value;
    if (!url) errorMessage.value = "لا توجد صورة إثبات لهذا الدفع.";
    return url;
  } catch (error) {
    errorMessage.value = error?.message || "تعذر تحميل صورة الإثبات.";
    return "";
  } finally {
    loading.value = false;
  }
};

const openPreview = async () => {
  dialogVisible.value = true;
  await ensureUrl();
};

watch(
  () => [props.proofUrl, props.paymentId, props.refundId, props.hasProof],
  () => {
    resolvedUrl.value = props.proofUrl || "";
    fetchedKey.value = null;
    errorMessage.value = "";
  },
  { immediate: true },
);
</script>
