<template>
  <AppDataTable
    v-model:expandedRows="expandedRows"
    data-key="id"
    :value="sales"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا توجد مبيعات قابلة للعرض."
    @page="$emit('page', $event)"
    @row-expand="onRowExpand"
  >
    <template #createdAt="{ data }">
      <AppDatetimeTableCell :value="data.createdAt" />
    </template>

    <template #student="{ data }">
      <AppStudentTableCell
        :student="{ name: data.studentName, phone: data.phone }"
      />
    </template>

    <template #products="{ data }">
      <SalesExchangeProductsCell :items="data.items" />
    </template>

    <template #quantity="{ data }">
      <span class="font-semibold tabular-nums">
        {{ data.quantitySummary?.label || "—" }}
      </span>
    </template>

    <template #totalAmount="{ data }">
      <SalesExchangeAmountCell :label="data.totalAmountLabel" />
    </template>

    <template #paidAmount="{ data }">
      <span class="text-sm font-medium tabular-nums">
        {{ data.paidAmountLabel || "—" }}
      </span>
    </template>

    <template #status="{ data }">
      <span
        v-if="isExchangeStatus(data.status)"
        class="inline-flex rounded-md bg-orange-500/20 px-2.5 py-1 text-xs font-semibold text-orange-300 ring-1 ring-inset ring-orange-400/40"
      >
        {{ data.statusLabel }}
      </span>
      <AppStatusTableCell
        v-else
        kind="sale"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>

    <template #actions="{ data }">
      <SalesExchangeActionsCell
        :sale="data"
        @exchange="$emit('exchange', $event)"
        @refund="$emit('refund', $event)"
      />
    </template>

    <template #expansion="{ data }">
      <SalesExchangeTimelineExpansion
        :events="getTimelineEvents(timelineKeyFor(data))"
        :loading="!!timelineState[timelineKeyFor(data)]?.loading"
        :error="timelineState[timelineKeyFor(data)]?.error || ''"
        @retry="loadTimeline(timelineKeyFor(data))"
      />
    </template>
  </AppDataTable>
</template>

<script setup>
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import SalesExchangeProductsCell from "~/components/dashboard/pages/sales/exchange/components/partials/SalesExchangeProductsCell.vue";
import SalesExchangeAmountCell from "~/components/dashboard/pages/sales/exchange/components/partials/SalesExchangeAmountCell.vue";
import SalesExchangeActionsCell from "~/components/dashboard/pages/sales/exchange/components/partials/SalesExchangeActionsCell.vue";
import SalesExchangeTimelineExpansion from "~/components/dashboard/pages/sales/exchange/components/partials/SalesExchangeTimelineExpansion.vue";
import { useSalesExchangeTableTimeline } from "~/components/dashboard/pages/sales/exchange/composables/useSalesExchangeTableTimeline";

defineOptions({ name: "SalesExchangeTable" });

const props = defineProps({
  sales: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["exchange", "refund", "page"]);

const {
  expandedRows,
  timelineState,
  getTimelineEvents,
  loadTimeline,
  timelineKeyFor,
  onRowExpand,
} = useSalesExchangeTableTimeline(() => [props.first, props.sales]);

const isExchangeStatus = (status) => {
  const key = String(status || "").toUpperCase();
  return key === "EXCHANGED" || key === "PARTIALLY_EXCHANGED";
};

const columns = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "createdAt", header: "التاريخ", slot: "createdAt" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "products", header: "المنتجات", slot: "products" },
  { field: "quantitySummary", header: "الكمية", slot: "quantity" },
  { field: "paidAmountLabel", header: "المدفوع", slot: "paidAmount" },
  { field: "totalAmountLabel", header: "الإجمالي", slot: "totalAmount" },
  { field: "branchName", header: "الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 12rem" },
];
</script>
