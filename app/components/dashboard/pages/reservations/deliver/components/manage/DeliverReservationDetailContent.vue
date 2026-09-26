<template>
  <div v-if="reservation" class="flex flex-col gap-4">
    <div class="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm text-slate-300">
      <DeliverReservationDetailInfoRow
        v-for="(row, index) in infoRows"
        :key="row.key"
        :label="row.label"
        :value="row.value"
        :root-class="index === 0 ? '' : 'mt-1'"
      >
        <span
          v-if="row.key === 'createdBy' && reservation.createdBy?.roleLabel"
          class="mr-1 rounded-md bg-slate-700/80 px-1.5 py-0.5 text-[11px] text-slate-300"
        >
          {{ reservation.createdBy.roleLabel }}
        </span>
      </DeliverReservationDetailInfoRow>

      <div class="mt-3 grid gap-2 rounded-lg border border-slate-700/80 bg-slate-950/40 p-3 text-sm">
        <DeliverReservationDetailAmountRow
          v-for="row in amountRows"
          :key="row.key"
          :label="row.label"
          :value="row.value"
          :bordered="row.bordered"
          :label-class="row.labelClass"
          :value-class="row.valueClass"
        />
      </div>
    </div>

    <div
      v-if="!needsRemainingPayment"
      class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
    >
      تم سداد المبلغ بالكامل. يمكن إتمام التسليم مباشرة.
    </div>

    <template v-else>
      <PaymentFields
        ref="paymentFieldsRef"
        :method="paymentMethod"
        :image="proofFile"
        :image-data-url="proofKey"
        :image-preview-url="proofPreviewUrl"
        :show-proof-source-choice="showProofSourceChoice"
        method-label="طريقة دفع المبلغ المتبقي"
        image-label="صورة إثبات دفع المتبقي"
        :method-invalid="!!methodError"
        :method-error="methodError"
        :image-invalid="proofRequiredError"
        show-image-when="non-cash"
        require-image-when="non-cash"
        @update:method="$emit('update:paymentMethod', $event)"
        @update:image="$emit('update:proofFile', $event)"
        @update:image-data-url="$emit('update:proofKey', $event)"
        @update:image-preview-url="$emit('update:proofPreviewUrl', $event)"
      />
    </template>

    <p v-if="dialogError" class="text-sm text-red-300">{{ dialogError }}</p>
  </div>
</template>

<script setup>
import PaymentFields from "~/components/shared/payment/payment-fields/index.vue";
import { PaymentMethod } from "~/enums/paymentMethod";
import { formatMoney } from "~/utils/format/money";
import { useAuth } from "~/composables/useAuth";

defineOptions({ name: "DeliverReservationDetailContent" });

const { isBranchEmployee } = useAuth();
const showProofSourceChoice = computed(() => isBranchEmployee.value);

const DeliverReservationDetailInfoRow = defineAsyncComponent(() =>
  import("../partials/DeliverReservationDetailInfoRow.vue"),
);
const DeliverReservationDetailAmountRow = defineAsyncComponent(() =>
  import("../partials/DeliverReservationDetailAmountRow.vue"),
);

const props = defineProps({
  reservation: { type: Object, default: null },
  needsRemainingPayment: { type: Boolean, default: false },
  paymentMethod: { type: String, default: PaymentMethod.CASH },
  proofFile: { type: [Object, File], default: null },
  proofKey: { type: String, default: "" },
  proofPreviewUrl: { type: String, default: "" },
  methodError: { type: String, default: "" },
  proofRequiredError: { type: Boolean, default: false },
  dialogError: { type: String, default: "" },
});

defineEmits([
  "update:paymentMethod",
  "update:proofFile",
  "update:proofKey",
  "update:proofPreviewUrl",
]);

const paymentFieldsRef = ref(null);

const infoRows = computed(() => {
  const r = props.reservation;
  if (!r) return [];
  return [
    { key: "number", label: "رقم الحجز", value: r.reservationNumber },
    { key: "student", label: "الطالب", value: r.student?.name },
    {
      key: "createdBy",
      label: "أنشئ بواسطة",
      value: r.createdBy?.fullName,
    },
    { key: "product", label: "المنتج", value: r.product?.name },
  ];
});

const amountRows = computed(() => {
  const r = props.reservation;
  if (!r) return [];
  return [
    {
      key: "total",
      label: "إجمالي المبلغ",
      value: formatMoney(r.product?.totalAmount),
      valueClass: "font-semibold text-slate-100",
    },
    {
      key: "paid",
      label: "المدفوع مسبقاً",
      value: formatMoney(r.payment?.paidAmount),
      valueClass: "font-semibold text-emerald-300",
    },
    {
      key: "remaining",
      label: "المتبقي",
      value: formatMoney(r.payment?.remainingAmount),
      bordered: true,
      labelClass: "text-base font-bold text-slate-200",
      valueClass: `text-2xl font-extrabold tracking-tight ${
        props.needsRemainingPayment ? "text-orange-300" : "text-emerald-300"
      }`,
    },
  ];
});

defineExpose({
  validatePayment: () => paymentFieldsRef.value?.validate?.() ?? true,
  resetPayment: () => paymentFieldsRef.value?.reset?.(),
});
</script>
