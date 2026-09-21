<template>
  <div v-if="sale" class="flex flex-col gap-4">
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
    >
      <AppDetailRows :items="summaryRows" />
    </div>

    <div class="flex flex-col gap-2 text-right">
      <div class="flex items-center justify-between gap-2">
        <label class="text-sm font-medium text-slate-700">
          كمية الاسترداد
        </label>
        <span class="text-xs text-slate-500">
          من 1 إلى {{ maxQuantity }}
        </span>
      </div>
      <AppInputNumber
        :model-value="refundQuantity"
        :min="1"
        :max="maxQuantity"
        :max-fraction-digits="0"
        :invalid="!!quantityError"
        @update:model-value="$emit('update:refundQuantity', $event)"
      />
      <p v-if="quantityError" class="text-xs text-red-500">{{ quantityError }}</p>
      <p v-else class="text-xs text-slate-500">
        سيتم استرداد {{ refundQuantity || 0 }} من أصل {{ maxQuantity }}
      </p>
    </div>

    <PaymentFields
      :method="refundMethod"
      :image="refundImage"
      :image-data-url="refundProofKey"
      method-label="طريقة الاسترداد"
      image-label="صورة إثبات الاسترداد"
      :method-invalid="!!refundError"
      :method-error="refundError"
      @update:method="$emit('update:refundMethod', $event)"
      @update:image="$emit('update:refundImage', $event)"
      @update:image-data-url="$emit('update:refundProofKey', $event)"
    />
  </div>
</template>

<script setup>
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import AppDetailRows from "~/components/shared/app-detail-rows/index.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { formatMoney } from "~/utils/format";
import { PaymentMethod } from "~/utils/paymentMethods";

const props = defineProps({
  sale: { type: Object, default: null },
  refundQuantity: { type: Number, default: 1 },
  refundMethod: { type: String, default: PaymentMethod.CASH },
  refundImage: { type: [Object, File], default: null },
  refundProofKey: { type: String, default: "" },
  refundError: { type: String, default: "" },
  quantityError: { type: String, default: "" },
});

defineEmits([
  "update:refundQuantity",
  "update:refundMethod",
  "update:refundImage",
  "update:refundProofKey",
]);

const maxQuantity = computed(() =>
  Math.max(
    1,
    Number(
      props.sale?.quantity?.remaining ?? props.sale?.remainingQuantity ?? 1,
    ),
  ),
);

const refundAmountLabel = computed(() => {
  const qty = Number(props.refundQuantity || 0);
  const unitPrice = Number(
    props.sale?.product?.unitPrice ?? props.sale?.unitPrice ?? 0,
  );
  if (qty > 0 && unitPrice > 0) {
    return formatMoney(unitPrice * qty);
  }
  return (
    props.sale?.product?.refundAmountLabel ||
    props.sale?.refundAmountLabel ||
    formatMoney(0)
  );
});

const summaryRows = computed(() => {
  const sale = props.sale || {};
  return [
    {
      key: "saleNumber",
      label: "رقم العملية",
      value: sale.saleNumber,
      valueClass: "font-semibold text-slate-900",
    },
    { key: "student", label: "الطالب", value: sale.student?.name || sale.studentName },
    { key: "phone", label: "الموبايل", value: sale.student?.phone || sale.phone || "—" },
    { key: "product", label: "المنتج", value: sale.product?.name || sale.productName },
    { key: "branch", label: "الفرع", value: sale.branch?.name || sale.branchName },
    {
      key: "maxQuantity",
      label: "الكمية القابلة للاسترداد",
      value: maxQuantity.value,
    },
    {
      key: "paymentMethod",
      label: "طريقة الدفع الأصلية",
      value: sale.payment?.methodLabel || sale.paymentMethodLabel,
    },
    {
      key: "unitPrice",
      label: "سعر الوحدة",
      value: sale.product?.unitPriceLabel || sale.unitPriceLabel,
    },
    {
      key: "refundAmount",
      label: "مبلغ الاسترداد",
      value: refundAmountLabel.value,
      valueClass: "font-semibold text-emerald-700",
    },
  ];
});
</script>
