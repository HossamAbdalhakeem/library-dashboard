<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    paginator
    :rows="15"
    empty-message="لا توجد حجوزات بانتظار المخزون خلال الفترة المحددة."
  >
    <template #product="{ data }">
      <AppProductTableCell :product="data.productCell" />
    </template>
    <template #count="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.qty)">
        {{ data.count }}
      </span>
    </template>
    <template #paid="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.paid)">
        {{ data.paidLabel }}
      </span>
    </template>
    <template #remaining="{ data }">
      <span
        class="metric-tag tabular-nums"
        :style="
          metricTagStyle(
            data.remainingRaw > 0
              ? METRIC_COLORS.remaining
              : METRIC_COLORS.remainingZero,
          )
        "
      >
        {{ data.remainingLabel }}
      </span>
    </template>
    <template #waiting="{ data }">
      <span
        class="metric-tag tabular-nums"
        :style="metricTagStyle(METRIC_COLORS.waiting)"
      >
        {{ data.waitingCount }}
      </span>
    </template>
  </AppDataTable>
</template>

<script setup>
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import { STOCK_MOVEMENT_COLORS } from "~/utils/domain-labels/inventory";
import {
  STUDENT_OPS_METRIC_COLORS,
  metricTagStyle,
} from "~/services/reports/shared/student-operations.helper";

defineOptions({ name: "ReservationsProductsTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineProps({
  rows: { type: Array, default: () => [] },
});

const METRIC_COLORS = {
  ...STUDENT_OPS_METRIC_COLORS,
  waiting: STOCK_MOVEMENT_COLORS.STOCK_OUT,
};

const columns = [
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "count", header: "العدد", slot: "count" },
  { field: "paidLabel", header: "المدفوع", slot: "paid" },
  { field: "remainingLabel", header: "المتبقي", slot: "remaining" },
  { field: "waitingCount", header: "بانتظار المخزون", slot: "waiting" },
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
