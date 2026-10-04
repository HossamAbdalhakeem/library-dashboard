<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    paginator
    :rows="15"
    empty-message="لا توجد مبيعات خلال الفترة المحددة."
  >
    <template #product="{ data }">
      <AppProductTableCell :product="data.productCell" />
    </template>
    <template #count="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.qty)">
        {{ data.count }}
      </span>
    </template>
    <template #quantity="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.qty)">
        {{ data.quantity }}
      </span>
    </template>
    <template #sales="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.price)">
        {{ data.salesLabel }}
      </span>
    </template>
    <template #returns="{ data }">
      <span
        class="metric-tag tabular-nums"
        :style="
          metricTagStyle(
            data.returnsRaw > 0 ? METRIC_COLORS.remaining : METRIC_COLORS.remainingZero,
          )
        "
      >
        {{ data.returnsLabel }}
      </span>
    </template>
    <template #fees="{ data }">
      <span
        v-if="data.feesRaw > 0"
        class="metric-tag tabular-nums"
        :style="metricTagStyle(METRIC_COLORS.activityPaid)"
      >
        {{ data.feesLabel }}
      </span>
      <span v-else class="text-sm text-slate-500">—</span>
    </template>
    <template #net="{ data }">
      <span
        class="metric-tag tabular-nums"
        :style="
          metricTagStyle(data.netRaw < 0 ? METRIC_COLORS.remaining : METRIC_COLORS.paid)
        "
      >
        {{ data.netLabel }}
      </span>
    </template>
  </AppDataTable>
</template>

<script setup>
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import {
  STUDENT_OPS_METRIC_COLORS,
  metricTagStyle,
} from "~/services/reports/shared/student-operations.helper";

defineOptions({ name: "SalesProductsTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineProps({
  rows: { type: Array, default: () => [] },
});

const METRIC_COLORS = STUDENT_OPS_METRIC_COLORS;

const columns = [
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "count", header: "عدد العمليات", slot: "count" },
  { field: "quantity", header: "الكمية", slot: "quantity" },
  { field: "salesLabel", header: "المبيعات", slot: "sales" },
  { field: "returnsLabel", header: "المرتجع", slot: "returns" },
  { field: "feesLabel", header: "رسوم التحويل", slot: "fees" },
  { field: "netLabel", header: "الصافي", slot: "net" },
];
</script>

<style scoped>
.metric-tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}
</style>
