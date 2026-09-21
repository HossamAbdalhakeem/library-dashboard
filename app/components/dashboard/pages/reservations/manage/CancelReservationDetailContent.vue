<template>
  <div v-if="reservation" class="flex flex-col gap-4">
    <div
      class="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200"
    >
      <div class="grid gap-2">
        <CancelReservationDetailRow
          v-for="row in infoRows"
          :key="row.key"
          :label="row.label"
          :value="row.value"
          :value-class="row.valueClass"
        />
      </div>

      <div class="mt-3 grid gap-2 rounded-lg border border-white/10 bg-slate-950/70 p-3">
        <CancelReservationDetailRow
          v-for="row in amountRows"
          :key="row.key"
          :label="row.label"
          :value="row.value"
          :bordered="row.bordered"
          :value-class="row.valueClass"
        />
      </div>
    </div>

    <div
      v-if="hasPaidDeposit"
      class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
    >
      <p class="mb-3 font-semibold text-emerald-200">
        مبلغ الرد للطالب: {{ reservation.payment?.paidAmountLabel || reservation.paidAmountLabel }}
      </p>
      <PaymentFields
        :method="refundMethod"
        :image="refundImage"
        :image-data-url="refundProofKey"
        method-label="طريقة رد المبلغ"
        image-label="صورة إثبات الاسترداد (اختياري)"
        show-image-when="non-cash"
        require-image-when="never"
        :method-invalid="!!refundError"
        :method-error="refundError"
        @update:method="$emit('update:refundMethod', $event)"
        @update:image="$emit('update:refundImage', $event)"
        @update:image-data-url="$emit('update:refundProofKey', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { PaymentMethod } from "~/utils/paymentMethods";
import { formatMoney } from "~/utils/format";

defineOptions({ name: "CancelReservationDetailContent" });

const CancelReservationDetailRow = defineAsyncComponent(() =>
  import("./partials/CancelReservationDetailRow.vue"),
);

const props = defineProps({
  reservation: { type: Object, default: null },
  refundMethod: { type: String, default: PaymentMethod.CASH },
  refundImage: { type: [Object, File], default: null },
  refundProofKey: { type: String, default: "" },
  refundError: { type: String, default: "" },
});

defineEmits([
  "update:refundMethod",
  "update:refundImage",
  "update:refundProofKey",
]);

const hasPaidDeposit = computed(
  () => Number(props.reservation?.payment?.paidAmount || 0) > 0,
);

const infoRows = computed(() => {
  const r = props.reservation;
  if (!r) return [];
  return [
    {
      key: "number",
      label: "رقم الحجز",
      value: r.reservationNumber,
      valueClass: "font-semibold text-white",
    },
    { key: "student", label: "الطالب", value: r.student?.name || r.studentName },
    { key: "phone", label: "الموبايل", value: r.student?.phone || r.phone || "—" },
    { key: "product", label: "المنتج", value: r.product?.name || r.productName },
    { key: "branch", label: "الفرع", value: r.branch?.name || r.branchName },
    { key: "quantity", label: "الكمية", value: r.quantity },
    { key: "status", label: "الحالة", value: r.statusLabel },
  ];
});

const amountRows = computed(() => {
  const r = props.reservation;
  if (!r) return [];
  return [
    {
      key: "total",
      label: "إجمالي المبلغ",
      value: formatMoney(r.product?.totalAmount ?? r.totalAmount),
      valueClass: "font-semibold text-slate-100",
    },
    {
      key: "paid",
      label: "المدفوع (مقدم)",
      value: r.payment?.paidAmountLabel || r.paidAmountLabel,
      valueClass: "font-semibold text-emerald-300",
    },
    {
      key: "remaining",
      label: "المتبقي",
      value: r.payment?.remainingAmountLabel || r.remainingAmountLabel,
      bordered: true,
      valueClass: "font-semibold text-amber-300",
    },
  ];
});
</script>
