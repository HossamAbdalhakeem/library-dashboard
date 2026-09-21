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
          v-if="loading && !resolvedUrl"
          class="flex h-64 w-full items-center justify-center text-slate-400"
        >
          <i class="pi pi-spin pi-spinner text-2xl" />
        </div>
        <img
          v-else-if="resolvedUrl"
          :src="resolvedUrl"
          alt="إثبات الدفع"
          class="max-h-[70vh] w-full rounded-xl object-contain"
        />
        <p v-else class="text-sm text-rose-400">
          {{ errorMessage || "تعذر عرض صورة الإثبات." }}
        </p>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import Dialog from "primevue/dialog";
import { paymentService } from "~/services/paymentService";
import {
  PAYMENT_METHOD_LABELS,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import { asData } from "~/utils/apiFetch";

defineOptions({ name: "PaymentProofThumb" });

const props = defineProps({
  /** Payment method enum (CASH / WALLET / INSTAPAY) */
  method: { type: String, default: "" },
  /** Arabic or display label — optional override */
  methodLabel: { type: String, default: "" },
  /** Signed URL from API when available */
  proofUrl: { type: String, default: "" },
  /** Payment UUID — used to fetch a fresh signed URL */
  paymentId: { type: [String, Number], default: null },
  /** Explicit flag from API */
  hasProof: { type: Boolean, default: null },
  /** Show method text next to the thumbnail */
  showLabel: { type: Boolean, default: true },
});

const loading = ref(false);
const dialogVisible = ref(false);
const resolvedUrl = ref("");
const errorMessage = ref("");
const fetchedForPaymentId = ref(null);

const resolvedMethodLabel = computed(() => {
  const method = String(props.method || "").trim().toUpperCase();
  if (PAYMENT_METHOD_LABELS[method]) return PAYMENT_METHOD_LABELS[method];

  const labelKey = String(props.methodLabel || "").trim().toUpperCase();
  if (PAYMENT_METHOD_LABELS[labelKey]) return PAYMENT_METHOD_LABELS[labelKey];

  return props.methodLabel || method || "—";
});

const isNonCash = computed(() =>
  paymentMethodNeedsProof(props.method || props.methodLabel),
);

const canShowProof = computed(() => {
  if (props.hasProof === true) return true;
  if (props.hasProof === false) return false;
  return (
    isNonCash.value &&
    Boolean(props.proofUrl || props.paymentId)
  );
});

const ensureUrl = async () => {
  if (resolvedUrl.value) return resolvedUrl.value;

  if (props.proofUrl) {
    resolvedUrl.value = props.proofUrl;
    return resolvedUrl.value;
  }

  if (
    props.paymentId &&
    fetchedForPaymentId.value === props.paymentId &&
    resolvedUrl.value
  ) {
    return resolvedUrl.value;
  }

  if (!props.paymentId) return "";

  loading.value = true;
  errorMessage.value = "";
  try {
    const result = asData(
      await paymentService.getPaymentScreenshot(String(props.paymentId)),
    );
    const url = result?.file_url || result?.fileUrl || "";
    resolvedUrl.value = url;
    fetchedForPaymentId.value = props.paymentId;
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
  () => [props.proofUrl, props.paymentId, props.hasProof],
  () => {
    resolvedUrl.value = props.proofUrl || "";
    fetchedForPaymentId.value = null;
    errorMessage.value = "";
    if (canShowProof.value && props.proofUrl) {
      resolvedUrl.value = props.proofUrl;
    }
  },
  { immediate: true },
);
</script>
