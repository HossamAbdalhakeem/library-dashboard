<template>
  <AppDataTable
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

    <template #type="{ data }">
      <span class="ops-tag" :style="tagStyle(data.typeColor)">
        {{ data.type }}
      </span>
    </template>

    <template #product="{ data }">
      <AppProductTableCell :product="data.productObj" />
    </template>

    <template #qty="{ data }">
      <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.qty)">
        {{ data.qty }}
      </span>
    </template>

    <template #price="{ data }">
      <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.price)">
        {{ data.price }}
      </span>
    </template>
  </AppDataTable>
</template>

<script setup>
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import { formatMoney } from "~/utils/format/money";
import { isFiniteNumber } from "~/utils/format/number";
import { DEFAULT_METRIC_COLOR } from "~/utils/domain-labels/shared";
import {
  STOCK_MOVEMENT_COLORS,
  getStockMovementColor,
  getStockMovementLabel,
} from "~/utils/domain-labels/inventory";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineOptions({ name: "OperationsTable" });

const METRIC_COLORS = {
  qty: STOCK_MOVEMENT_COLORS.STOCK_IN,
  price: STOCK_MOVEMENT_COLORS.SALE,
};

const tagStyle = (color) => {
  const c = color || DEFAULT_METRIC_COLOR;
  return {
    color: c,
    backgroundColor: `${c}22`,
    border: `1px solid ${c}55`,
  };
};

const props = defineProps({
  rows: { type: Array, default: () => [] },
  typeLabels: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات خلال الفترة المحددة.",
  },
});

const emit = defineEmits(["update:page"]);

const columns = [
  { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
  { field: "type", header: "النوع", slot: "type" },
  { field: "product", header: "المنتج", slot: "product" },
  { field: "qty", header: "الكمية", slot: "qty" },
  { field: "price", header: "الإجمالي", slot: "price" },
];

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * props.pageSize),
);

const resolveLabel = (typeKey) => {
  const custom = props.typeLabels?.[typeKey];
  if (custom) return custom;
  return getStockMovementLabel(typeKey);
};

const moneyLabel = (value) => {
  if (value == null || value === "") return null;
  return formatMoney(value, "locale");
};

const moneyOrDash = (value) => moneyLabel(value) || "-";

const toProductCell = (product, options = {}) => {
  const name = product?.name || null;
  if (!name) return null;

  return {
    name,
    price: moneyLabel(options.price ?? product?.price),
    teacherName: options.teacherName || product?.teacher?.name || null,
    studyYearName: product?.studyYear?.name || null,
    priceColor: options.priceColor || STOCK_MOVEMENT_COLORS.SALE,
  };
};

const displayRows = computed(() =>
  (Array.isArray(props.rows) ? props.rows : []).map((row) => {
    const typeKey = String(row.type || "").toUpperCase();
    const product = row.product || null;
    const teacher = row.teacher || product?.teacher || null;
    const qty = Number(row.quantity ?? 0);
    return {
      createdAt: row.createdAt || row.time || null,
      productObj: toProductCell(product, {
        teacherName: teacher?.name || null,
        price: product?.price ?? product?.sellingPrice ?? null,
      }),
      type: resolveLabel(typeKey),
      typeKey,
      typeColor: getStockMovementColor(typeKey),
      qty: isFiniteNumber(qty) ? Math.abs(qty) : 0,
      price: moneyOrDash(row.price),
    };
  }),
);

const onPage = (event) => {
  const nextPage = Math.floor(Number(event?.first || 0) / props.pageSize) + 1;
  emit("update:page", nextPage);
};
</script>

<style scoped>
.ops-tag {
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
