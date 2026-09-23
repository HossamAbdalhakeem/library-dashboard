<template>
  <div>
    <Dialog
      :visible="detailVisible"
      modal
      dir="rtl"
      header="تفاصيل البيع قبل الاسترداد"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="onDetailVisible"
    >
      <RefundDetailContent
        v-if="detailVisible && sale"
        :sale="sale"
        :refund-quantity="refundQuantity"
        :refund-method="refundMethod"
        :refund-image="refundImage"
        :refund-proof-key="refundProofKey"
        :refund-error="refundError"
        :quantity-error="quantityError"
        @update:refund-quantity="onQuantityChange"
        @update:refund-method="refundMethod = $event"
        @update:refund-image="refundImage = $event"
        @update:refund-proof-key="refundProofKey = $event"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاسترداد"
            severity="danger"
            icon="pi pi-replay"
            :disabled="!sale || busy"
            @click="requestConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="close"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      :visible="confirmVisible"
      modal
      dir="rtl"
      header="تأكيد الاسترداد"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="(v) => (confirmVisible = v)"
    >
      <RefundConfirmContent
        v-if="confirmVisible"
        :sale="sale"
        :refund-quantity="refundQuantity"
        :refund-amount-label="refundAmountLabel"
        :refund-method-label="refundMethodLabel"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاسترداد"
            severity="danger"
            :loading="busy"
            :disabled="busy"
            @click="confirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="confirmVisible = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { returnApi, buildReturnPayload } from "~/services/return";
import { useAppToast } from "~/composables/useAppToast";
import { formatMoney } from "~/utils/format/money";
import { isFiniteNumber } from "~/utils/format/number";
import {
  getPaymentMethodLabel,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";

const RefundDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/components/manage/RefundDetailContent.vue"),
);
const RefundConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/components/manage/RefundConfirmContent.vue"),
);

defineOptions({ name: "SalesExchangeRefundFlow" });

const props = defineProps({
  sale: { type: Object, default: null },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "done", "close"]);

const { showError, showSuccess } = useAppToast();

const busy = ref(false);
const confirmVisible = ref(false);
const refundQuantity = ref(1);
const refundMethod = ref(PaymentMethod.CASH);
const refundImage = ref(null);
const refundProofKey = ref("");
const refundError = ref("");
const quantityError = ref("");

const detailVisible = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const maxQuantity = computed(() =>
  Math.max(1, Number(props.sale?.quantity?.remaining || 1)),
);

const refundMethodLabel = computed(() =>
  getPaymentMethodLabel(refundMethod.value),
);

const refundAmountLabel = computed(() => {
  const qty = Number(refundQuantity.value || 0);
  const unitPrice = Number(props.sale?.product?.unitPrice || 0);
  if (qty > 0 && unitPrice > 0) {
    return formatMoney(unitPrice * qty);
  }
  return props.sale?.product?.refundAmountLabel || formatMoney(0);
});

const clampQuantity = (value) => {
  const max = maxQuantity.value;
  const parsed = Math.floor(Number(value));
  if (!isFiniteNumber(parsed) || parsed < 1) return 1;
  if (parsed > max) return max;
  return parsed;
};

const onQuantityChange = (value) => {
  quantityError.value = "";
  refundQuantity.value = clampQuantity(value);
};

const resetFields = () => {
  refundQuantity.value = maxQuantity.value;
  refundMethod.value = PaymentMethod.CASH;
  refundImage.value = null;
  refundProofKey.value = "";
  refundError.value = "";
  quantityError.value = "";
  confirmVisible.value = false;
};

const close = () => {
  if (busy.value) return;
  detailVisible.value = false;
  resetFields();
  emit("close");
};

const onDetailVisible = (value) => {
  if (!value) close();
  else detailVisible.value = true;
};

const requestConfirm = () => {
  refundError.value = "";
  quantityError.value = "";

  const qty = clampQuantity(refundQuantity.value);
  refundQuantity.value = qty;

  if (qty < 1) {
    quantityError.value = "كمية الاسترداد يجب أن تكون 1 على الأقل.";
    return;
  }
  if (qty > maxQuantity.value) {
    quantityError.value = `كمية الاسترداد لا يمكن أن تتجاوز ${maxQuantity.value}.`;
    return;
  }
  if (!refundMethod.value) {
    refundError.value = "اختر طريقة الاسترداد.";
    return;
  }
  if (
    paymentMethodNeedsProof(refundMethod.value) &&
    !String(refundProofKey.value || "").trim()
  ) {
    refundError.value = "صورة إثبات الاسترداد مطلوبة لطريقة الاسترداد المحددة.";
    return;
  }
  confirmVisible.value = true;
};

const confirm = async () => {
  if (!props.sale?.saleId || !props.sale?.saleItemId) return;
  const qty = clampQuantity(refundQuantity.value);
  if (qty < 1 || qty > maxQuantity.value) {
    quantityError.value = `كمية الاسترداد يجب أن تكون بين 1 و ${maxQuantity.value}.`;
    confirmVisible.value = false;
    return;
  }

  busy.value = true;
  try {
    await returnApi.createReturn(
      buildReturnPayload({
        saleId: props.sale.saleId,
        saleItemId: props.sale.saleItemId,
        quantity: qty,
        method: refundMethod.value,
        proofReference: refundProofKey.value || undefined,
      }),
    );
    confirmVisible.value = false;
    detailVisible.value = false;
    resetFields();
    showSuccess("تم استرداد المنتج بنجاح.");
    emit("done");
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاسترداد.");
  } finally {
    busy.value = false;
  }
};

watch(
  () => props.open,
  (open) => {
    if (open) resetFields();
  },
);

watch(
  () => props.sale?.quantity?.remaining,
  () => {
    if (props.open) {
      refundQuantity.value = maxQuantity.value;
    }
  },
);
</script>
