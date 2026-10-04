<template>
  <div class="w-full min-w-0">
    <AppDataTable
      data-key="id"
      :value="displayRows"
      :columns="columns"
      :loading="loading"
      lazy
      paginator
      :rows="pageSize"
      :first="first"
      :total-records="totalRecords"
      :empty-message="emptyMessage"
      @page="onPage"
    >
      <template #time="{ data }">
        <AppDatetimeTableCell :value="data.createdAt" />
      </template>

      <template #kind="{ data }">
        <div class="flex min-w-0 flex-col items-start gap-0.5">
          <span class="ops-tag" :style="kindStyle(data.kindColor)">
            {{ data.kindLabel }}
          </span>
          <span v-if="data.kindHint" class="text-[11px] text-slate-400">
            {{ data.kindHint }}
          </span>
        </div>
      </template>

      <template #source="{ data }">
        <span
          v-if="data.sourceLabel"
          class="ops-tag"
          :style="kindStyle(data.sourceColor)"
        >
          {{ data.sourceLabel }}
        </span>
        <span v-else class="text-slate-500">—</span>
      </template>

      <template #student="{ data }">
        <AppStudentTableCell
          :student="{ name: data.studentName, phone: data.studentPhone }"
        />
      </template>

      <template #product="{ data }">
        <SalesExchangeProductsCell :items="productItems(data)" />
      </template>

      <template #refund="{ data }">
        <span class="ops-tag tabular-nums" :style="moneyStyle(data.refundAmount, 'refund')">
          {{ data.refundAmountLabel }}
        </span>
      </template>

      <template #collected="{ data }">
        <span
          class="ops-tag tabular-nums"
          :style="moneyStyle(data.collectedAmount, 'collect')"
        >
          {{ data.collectedAmountLabel }}
        </span>
      </template>

      <template #method="{ data }">
        <span v-if="!data.payment.method" class="text-slate-500">—</span>
        <PaymentProofThumb
          v-else
          :method="data.payment.method"
          :method-label="data.payment.methodLabel"
          :has-proof="data.payment.image.hasProof"
          :payment-id="data.payment.proofPaymentId"
          :refund-id="data.payment.proofRefundId"
        />
      </template>

      <template #original="{ data }">
        <div class="flex min-w-0 flex-col gap-0.5 text-xs text-slate-300">
          <AppDatetimeTableCell :value="data.originalCreatedAt" />
          <span class="break-all font-mono text-slate-500">
            {{ originalRefLabel(data.originalRef) }}
          </span>
        </div>
      </template>
    </AppDataTable>

    <div class="mt-3 grid gap-2 sm:grid-cols-2">
      <div
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3"
      >
        <span class="text-sm font-medium text-rose-200">إجمالي المبالغ المستردة</span>
        <span class="text-lg font-extrabold tabular-nums text-rose-700 dark:text-rose-100">
          {{ totalRefundLabel }}
        </span>
      </div>
      <div
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"
      >
        <span class="text-sm font-medium text-emerald-200">إجمالي المبالغ المحصّلة</span>
        <span class="text-lg font-extrabold tabular-nums text-emerald-700 dark:text-emerald-100">
          {{ totalCollectedLabel }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";
import SalesExchangeProductsCell from "~/components/dashboard/pages/sales/exchange/components/partials/SalesExchangeProductsCell.vue";
import { normalizeOperationKind } from "~/enums/operationKind";
import { getPaymentMethodLabel, normalizePaymentMethod } from "~/enums/paymentMethod";
import {
  getOperationActivityColor,
  getOperationActivityLabel,
} from "~/utils/domain-labels/student-operations";
import {
  REFUND_EVENT_DEFERRED_HINT,
  getRefundEventKindLabel,
} from "~/utils/domain-labels/report";
import { formatMoney } from "~/utils/format/money";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineOptions({ name: "RefundEventsTable" });

const KIND_COLORS = {
  RETURN: "#fb7185",
  EXCHANGE: "#a78bfa",
  RESERVATION_CANCEL: "#f97316",
  SALE_REFUND: "#f43f5e",
};

const SETTLEMENT_COLORS = {
  REFUND: "#a78bfa",
  COLLECT: "#38bdf8",
  EVEN: "#c4b5fd",
  DEFERRED_TO_DELIVERY: "#a78bfa",
};

const REFUND_COLOR = "#fb7185";
const COLLECT_COLOR = "#34d399";
const ZERO_COLOR = "#94a3b8";

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  totalAmount: { type: [Number, String], default: 0 },
  totalCollectedAmount: { type: [Number, String], default: 0 },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات استرداد أو إلغاء أو استبدال خلال الفترة المحددة.",
  },
});

const emit = defineEmits(["update:page"]);

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * Number(props.pageSize || 15)),
);

const totalRefundLabel = computed(() => formatMoney(props.totalAmount));
const totalCollectedLabel = computed(() =>
  formatMoney(props.totalCollectedAmount),
);

const kindStyle = (color) => ({
  color,
  backgroundColor: `${color}22`,
  border: `1px solid ${color}55`,
});

const moneyStyle = (amount, tone) => {
  const active = tone === "collect" ? COLLECT_COLOR : REFUND_COLOR;
  const color = Number(amount) > 0 ? active : ZERO_COLOR;
  return kindStyle(color);
};

const originalRefLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw === "-") return "—";
  return raw;
};

const productItems = (row) => [
  {
    saleItemId: row.id || "product",
    product: { name: row.productName || "—" },
    exchange: row.exchangeToName
      ? { newProduct: { name: row.exchangeToName } }
      : null,
  },
];

const toMoney = (value, fallback = 0) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : fallback;
};

const displayRows = computed(() =>
  (props.rows || []).map((row) => {
    const kind = String(row.kind || "SALE_REFUND").toUpperCase();
    const settlement = String(row.settlement || "").toUpperCase();
    const source = normalizeOperationKind(row.source);
    const refundAmount = toMoney(
      row.refundAmount != null ? row.refundAmount : row.amount,
    );
    const collectedAmount = toMoney(row.collectedAmount, 0);
    const rawMethod = row.payment?.method;
    const method = rawMethod ? normalizePaymentMethod(rawMethod, "") : "";
    const hasProof = Boolean(row.payment?.image?.hasProof);
    const isCollect = settlement === "COLLECT";

    return {
      ...row,
      kind,
      kindLabel: getRefundEventKindLabel(kind, settlement),
      kindColor:
        (kind === "EXCHANGE" && SETTLEMENT_COLORS[settlement]) ||
        KIND_COLORS[kind] ||
        KIND_COLORS.SALE_REFUND,
      kindHint:
        settlement === "DEFERRED_TO_DELIVERY" ? REFUND_EVENT_DEFERRED_HINT : "",
      source,
      sourceLabel: source ? getOperationActivityLabel(source) : "",
      sourceColor: source ? getOperationActivityColor(source) : "",
      refundAmount,
      collectedAmount,
      refundAmountLabel: formatMoney(refundAmount),
      collectedAmountLabel: formatMoney(collectedAmount),
      payment: {
        id: row.payment?.id ?? null,
        method,
        methodLabel: method
          ? row.payment?.methodLabel || getPaymentMethodLabel(method)
          : "",
        image: {
          reference: row.payment?.image?.reference ?? null,
          url: row.payment?.image?.url ?? null,
          hasProof,
        },
        proofPaymentId: isCollect && hasProof ? row.payment?.id ?? null : null,
        proofRefundId: !isCollect && hasProof ? row.id : null,
      },
      studentName: row.studentName || "—",
      studentPhone: row.studentPhone || "",
      productName: row.productName || "—",
    };
  }),
);

const columns = [
  { field: "createdAt", header: "الوقت", slot: "time" },
  { field: "kindLabel", header: "النوع", slot: "kind" },
  { field: "sourceLabel", header: "المصدر", slot: "source" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "productName", header: "المنتج", slot: "product" },
  { field: "refundAmountLabel", header: "المبلغ المسترد", slot: "refund" },
  { field: "collectedAmountLabel", header: "المبلغ المحصّل", slot: "collected" },
  { field: "payment.methodLabel", header: "الطريقة", slot: "method" },
  { field: "originalCreatedAt", header: "العملية الأصلية", slot: "original" },
];

const onPage = (event) => {
  emit("update:page", (event?.page ?? 0) + 1);
};
</script>

<style scoped>
.ops-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
