<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <p class="font-bold text-white">{{ title }}</p>
        <p v-if="subtitle" class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
      </div>

      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
        <ReportOperationTypeFilter
          v-model="selectedType"
          :labels="typeFilterLabels"
          label="نوع العملية"
          :disabled="loading"
          @change="onTypeChange"
        />
      </div>
    </div>

    <div v-if="loading && !rows.length" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`ops-skel-${i}`" height="2.4rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="$emit('retry')"
    />

    <ReportsSectionEmpty
      v-else-if="!loading && !displayRows.length"
      :message="emptyMessage"
    />

    <AppDataTable
      v-else
      :value="displayRows"
      :columns="resolvedColumns"
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
        <AppDateTimeCell :value="data.createdAt" />
      </template>

      <template #type="{ data }">
        <span class="ops-tag" :style="tagStyle(data.typeColor)">
          {{ data.type }}
        </span>
      </template>

      <template #product="{ data }">
        <ProductCell :product="data.productObj" />
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
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/index.vue";
import ProductCell from "~/components/shared/product-cell/index.vue";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import ReportOperationTypeFilter from "~/components/shared/report-operation-type-filter/index.vue";
import { formatMoney } from "~/utils/format";
import {
  DEFAULT_METRIC_COLOR,
  STOCK_MOVEMENT_COLORS,
  getStockMovementColor,
  getStockMovementLabel,
} from "~/utils/domainLabels";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

defineOptions({ name: "DailyReportOperationsSection" });

/** Same chip palette as type tags (STOCK_MOVEMENT_COLORS). */
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
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات خلال الفترة المحددة.",
  },
  /** Map of type code → Arabic label (row chips + fallback filter) */
  typeLabels: { type: Object, default: () => ({}) },
  /** Optional shorter map for the type filter only */
  filterLabels: { type: Object, default: null },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  movementType: { type: String, default: null },
});

const emit = defineEmits(["retry", "update:page", "update:movementType"]);

const selectedType = ref(props.movementType || null);

watch(
  () => props.movementType,
  (value) => {
    selectedType.value = value || null;
  },
);

const typeFilterLabels = computed(() => {
  if (props.filterLabels && Object.keys(props.filterLabels).length) {
    return props.filterLabels;
  }
  return props.typeLabels || {};
});

const resolvedColumns = computed(() => [
  { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
  { field: "type", header: "النوع", slot: "type" },
  { field: "product", header: "المنتج", slot: "product" },
  { field: "qty", header: "الكمية", slot: "qty" },
  { field: "price", header: "السعر", slot: "price" },
]);

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

/** Shape ProductCell expects: { name, price?, teacherName?, studyYearName?, priceColor? } */
const toProductCell = (product, options = {}) => {
  const name = product?.name || null;
  if (!name) return null;

  const priceValue =
    options.price ?? product?.price ?? product?.sellingPrice ?? null;
  const teacherName =
    options.teacherName ||
    product?.teacher?.name ||
    product?.teacherName ||
    null;
  const studyYearName =
    product?.studyYear?.name || product?.studyYearName || null;

  return {
    name,
    price: moneyLabel(priceValue),
    teacherName: teacherName || null,
    studyYearName: studyYearName || null,
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
      qty: Number.isFinite(qty) ? Math.abs(qty) : 0,
      price: moneyOrDash(row.price),
    };
  }),
);

const onTypeChange = (value) => {
  emit("update:movementType", value || null);
};

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
