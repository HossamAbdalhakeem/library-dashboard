<template>
  <div v-if="saleSummary" class="flex flex-col items-center text-center">
    <div
      class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white"
    >
      ✓
    </div>
    <p class="text-base font-bold text-slate-900">تم تسجيل البيع بنجاح</p>

    <div
      class="mt-5 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right"
    >
      <SaleSuccessSummaryRow
        v-for="row in summaryRows"
        :key="row.key"
        :label="row.label"
        :value="row.value"
        :bordered="row.bordered !== false"
        :stacked="Boolean(row.stacked)"
        :label-class="row.labelClass"
        :value-class="row.valueClass"
        :border-class="row.borderClass"
      >
        <template v-if="row.key === 'product'">
          <div class="text-sm font-semibold text-slate-900">
            <p>{{ saleSummary.productName }}</p>
            <p
              v-if="saleSummary.teacherName"
              class="mt-0.5 text-xs font-normal text-slate-500"
            >
              مقدم من أ/ {{ saleSummary.teacherName }}
            </p>
          </div>
        </template>

        <template v-else-if="row.key === 'method'">
          <PaymentProofThumb
            :method="saleSummary.method"
            :method-label="saleSummary.methodLabel"
            :payment-id="saleSummary.paymentId"
            :has-proof="saleSummary.hasProof"
            :proof-url="saleSummary.paymentId ? '' : saleSummary.proofImage"
          />
        </template>
      </SaleSuccessSummaryRow>
    </div>
  </div>
</template>

<script setup>
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";
import { formatMoney } from "~/utils/format/money";

defineOptions({ name: "SaleSuccessDialogContent" });

const SaleSuccessSummaryRow = defineAsyncComponent(() =>
  import("./partials/SaleSuccessSummaryRow.vue"),
);

const props = defineProps({
  saleSummary: { type: Object, default: null },
});

const summaryRows = computed(() => {
  const summary = props.saleSummary;
  if (!summary) return [];

  const rows = [
    {
      key: "paymentNumber",
      label: "رقم الدفع",
      value: summary.paymentNumber,
      bordered: false,
      valueClass: "text-sm font-bold text-slate-900 break-all",
    },
    {
      key: "dateTime",
      label: "التاريخ والوقت",
      value: summary.dateTimeLabel,
    },
    {
      key: "product",
      label: "المنتج",
    },
    {
      key: "studyYear",
      label: "السنة الدراسية",
      value: summary.studyYearName || "-",
    },
    {
      key: "student",
      label: "الطالب",
      value: summary.studentName,
    },
    {
      key: "quantity",
      label: "الكمية",
      value: summary.quantity,
    },
    {
      key: "unitPrice",
      label: "سعر الوحدة",
      value: formatMoney(summary.unitPrice),
    },
    {
      key: "method",
      label: "طريقة الدفع",
    },
  ];

  rows.push({
    key: "total",
    label: "الإجمالي",
    value: formatMoney(summary.totalAmount),
    labelClass: "text-sm font-semibold text-emerald-700",
    valueClass: "text-lg font-extrabold text-emerald-700",
    borderClass: "border-emerald-200",
  });

  return rows;
});
</script>
