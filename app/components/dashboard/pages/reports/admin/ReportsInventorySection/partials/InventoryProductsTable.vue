<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    paginator
    :rows="15"
    empty-message="لا توجد كميات مسجلة."
  >
    <template #product="{ data }">
      <AppProductTableCell :product="data.productCell" />
    </template>
    <template #physical="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.qty)">
        {{ data.physicalQuantity }}
      </span>
    </template>
    <template #reserved="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.reserved)">
        {{ data.reservedQuantity }}
      </span>
    </template>
    <template #available="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(availableColor(data))">
        {{ data.availableQuantity }}
      </span>
    </template>
    <template v-if="showThreshold" #threshold="{ data }">
      <span class="metric-tag tabular-nums" :style="metricTagStyle(METRIC_COLORS.remainingZero)">
        {{ data.lowStockThreshold }}
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

defineOptions({ name: "InventoryProductsTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

const props = defineProps({
  rows: { type: Array, default: () => [] },
  showThreshold: { type: Boolean, default: false },
});

const METRIC_COLORS = {
  ...STUDENT_OPS_METRIC_COLORS,
  reserved: STOCK_MOVEMENT_COLORS.RESERVATION,
  low: STOCK_MOVEMENT_COLORS.STOCK_OUT,
};

const columns = computed(() => {
  const base = [
    { field: "productCell", header: "المنتج", slot: "product" },
    { field: "physicalQuantity", header: "الفعلي", slot: "physical" },
    { field: "reservedQuantity", header: "المحجوز", slot: "reserved" },
    { field: "availableQuantity", header: "المتاح", slot: "available" },
  ];
  if (!props.showThreshold) return base;
  return [
    ...base,
    { field: "lowStockThreshold", header: "حد التنبيه", slot: "threshold" },
  ];
});

const availableColor = (row) => {
  if (Number(row.availableQuantity) <= 0) return METRIC_COLORS.remaining;
  if (
    props.showThreshold &&
    row.lowStockThreshold != null &&
    Number(row.availableQuantity) <= Number(row.lowStockThreshold)
  ) {
    return METRIC_COLORS.low;
  }
  return METRIC_COLORS.qty;
};
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
