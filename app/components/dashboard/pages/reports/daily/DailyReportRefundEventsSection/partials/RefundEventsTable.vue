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
        <span class="ops-tag" :style="kindStyle(data.kind)">
          {{ data.kindLabel }}
        </span>
      </template>

      <template #student="{ data }">
        <AppStudentTableCell
          :student="{ name: data.studentName, phone: data.studentPhone }"
        />
      </template>

      <template #product="{ data }">
        <SalesExchangeProductsCell :items="productItems(data)" />
      </template>

      <template #amount="{ data }">
        <span class="ops-tag tabular-nums" :style="amountStyle">
          {{ data.amountLabel }}
        </span>
      </template>

      <template #method="{ data }">
        <PaymentProofThumb
          :method="data.payment.method"
          :method-label="data.payment.methodLabel"
          :has-proof="data.payment.image.hasProof"
          :refund-id="data.payment.image.hasProof ? data.id : null"
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

    <div
      class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3"
    >
      <span class="text-sm font-medium text-rose-200">إجمالي المبالغ المستردة</span>
      <span class="text-lg font-extrabold tabular-nums text-rose-100">
        {{ totalAmountLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";
import SalesExchangeProductsCell from "~/components/dashboard/pages/sales/exchange/components/partials/SalesExchangeProductsCell.vue";
import { formatMoney } from "~/utils/format/money";
import { getPaymentMethodLabel, normalizePaymentMethod } from "~/enums/paymentMethod";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineOptions({ name: "RefundEventsTable" });

const KIND_META = {
  RETURN: { label: "مرتجع بيع", color: "#fb7185" },
  EXCHANGE: { label: "استبدال (رد فرق)", color: "#a78bfa" },
  RESERVATION_CANCEL: { label: "إلغاء حجز", color: "#f97316" },
  SALE_REFUND: { label: "استرداد بيع", color: "#f43f5e" },
};

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  totalAmount: { type: [Number, String], default: 0 },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات استرداد أو إلغاء خلال الفترة المحددة.",
  },
});

const emit = defineEmits(["update:page"]);

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * Number(props.pageSize || 15)),
);

const totalAmountLabel = computed(() =>
  formatMoney(props.totalAmount),
);

const amountStyle = {
  color: "#fb7185",
  backgroundColor: "#fb718522",
  border: "1px solid #fb718555",
};

const kindStyle = (kind) => {
  const color = KIND_META[kind]?.color || "#94a3b8";
  return {
    color,
    backgroundColor: `${color}22`,
    border: `1px solid ${color}55`,
  };
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

const displayRows = computed(() =>
  (props.rows || []).map((row) => {
    const kind = String(row.kind || "SALE_REFUND").toUpperCase();
    const meta = KIND_META[kind] || KIND_META.SALE_REFUND;
    const method = normalizePaymentMethod(row.payment?.method);
    return {
      ...row,
      kind,
      kindLabel: meta.label,
      amountLabel: formatMoney(row.amount),
      payment: {
        id: row.payment?.id ?? null,
        method,
        methodLabel:
          row.payment?.methodLabel || getPaymentMethodLabel(method),
        image: {
          reference: row.payment?.image?.reference ?? null,
          url: row.payment?.image?.url ?? null,
          hasProof: Boolean(row.payment?.image?.hasProof),
        },
      },
      studentName: row.studentName || "—",
      studentPhone: row.studentPhone || "",
      productName: row.productName || "—",
    };
  }),
);

const columns = [
  { field: "createdAt", header: "وقت الاسترداد", slot: "time" },
  { field: "kindLabel", header: "النوع", slot: "kind" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "productName", header: "المنتج", slot: "product" },
  { field: "amountLabel", header: "المبلغ المسترد", slot: "amount" },
  { field: "payment.methodLabel", header: "طريقة الرد", slot: "method" },
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
