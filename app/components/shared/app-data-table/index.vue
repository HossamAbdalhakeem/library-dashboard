<template>
  <div
    ref="wrapRef"
    class="app-data-table-wrap overflow-hidden rounded-xl border border-slate-700 bg-slate-900"
  >
    <div v-if="loading" class="grid gap-3 p-4">
      <Skeleton
        v-for="i in skeletonRows"
        :key="i"
        width="100%"
        height="3rem"
        border-radius="12px"
      />
    </div>

    <div v-else class="app-data-table-scroll">
      <DataTable
        v-bind="tableAttrs"
        :value="value"
        :paginator="paginator"
        :rows="rows"
        :lazy="lazy"
        :first="first"
        :total-records="totalRecords"
        :row-class="rowClass"
        :table-style="resolvedTableStyle"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        current-page-report-template="{first} إلى {last} من {totalRecords}"
        class="app-data-table"
        size="small"
        striped-rows
        @page="onPage"
        @row-expand="onRowExpand"
      >
        <template #empty>
          <div class="app-data-table-empty">
            {{ emptyMessage }}
          </div>
        </template>

        <template v-if="$slots.expansion" #expansion="slotProps">
          <slot name="expansion" v-bind="slotProps" />
        </template>

        <slot>
          <Column
            v-for="col in resolvedColumns"
            :key="col.key || col.field || col.header"
            :field="col.field"
            :header="col.header"
            :sortable="col.sortable"
            :style="col.style"
            :header-style="col.headerStyle || col.style"
            :body-style="col.bodyStyle || col.style"
            :class="col.class"
            :header-class="col.headerClass"
            :body-class="col.bodyClass"
            :expander="col.expander"
          >
            <template v-if="hasCustomBody(col)" #body="slotProps">
              <slot
                v-if="col.slot || (col.field && $slots[col.field])"
                :name="col.slot || col.field"
                v-bind="slotProps"
              >
                {{ resolveCell(slotProps.data, col) }}
              </slot>
              <template v-else>
                {{ resolveCell(slotProps.data, col) }}
              </template>
            </template>
          </Column>
        </slot>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Skeleton from "primevue/skeleton";
import { toArabicDigits } from "~/utils/format.js";

defineOptions({
  name: "AppDataTable",
  inheritAttrs: false,
});

const props = defineProps({
  value: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: "لا توجد بيانات." },
  paginator: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  lazy: { type: Boolean, default: false },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
  tableStyle: { type: String, default: "" },
  minColumnWidth: { type: String, default: "8.5rem" },
  rowClass: { type: [Function, String, Object], default: undefined },
  skeletonRows: { type: Number, default: 5 },
});

const emit = defineEmits(["page", "row-expand"]);

const wrapRef = ref(null);
let paginatorObserver = null;

const arabicizePaginatorDigits = () => {
  const root = wrapRef.value;
  if (!root) return;

  const targets = root.querySelectorAll(
    [
      ".p-paginator-page",
      ".p-paginator-current",
      ".p-paginator .p-select-label",
      ".p-paginator .p-dropdown-label",
    ].join(", "),
  );

  targets.forEach((node) => {
    const raw = node.textContent ?? "";
    if (!/[0-9]/.test(raw)) return;
    const next = toArabicDigits(raw);
    if (raw !== next) node.textContent = next;
  });
};

const onPage = (event) => {
  emit("page", event);
  nextTick(arabicizePaginatorDigits);
};

const onRowExpand = (event) => {
  emit("row-expand", event);
};

const attrs = useAttrs();
const slots = useSlots();

const tableAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const resolvedColumns = computed(() => {
  const cols = props.columns || [];

  return cols.map((col) => {
    if (col.style || col.headerStyle || col.bodyStyle) {
      return { ...col };
    }

    return {
      ...col,
      style: `min-width: ${col.minWidth || props.minColumnWidth}`,
    };
  });
});

const resolvedTableStyle = computed(() => {
  if (props.tableStyle) return props.tableStyle;
  const colCount = Math.max(resolvedColumns.value.length, 1);
  // Grow beyond the container when there are many columns so horizontal scroll appears.
  return `min-width: max(100%, calc(${colCount} * ${props.minColumnWidth}))`;
});

const hasCustomBody = (col) =>
  Boolean(col.slot || col.format || (col.field && slots[col.field]));

const resolveCell = (row, col) => {
  const raw = col.field ? row?.[col.field] : undefined;
  if (typeof col.format === "function") return col.format(raw, row);
  if (raw == null || raw === "") return col.fallback ?? "-";
  return raw;
};

onMounted(() => {
  nextTick(arabicizePaginatorDigits);
  if (!wrapRef.value || typeof MutationObserver === "undefined") return;

  paginatorObserver = new MutationObserver(() => {
    arabicizePaginatorDigits();
  });
  paginatorObserver.observe(wrapRef.value, {
    childList: true,
    subtree: true,
    characterData: true,
  });
});

onBeforeUnmount(() => {
  paginatorObserver?.disconnect();
  paginatorObserver = null;
});

watch(
  () => [props.loading, props.first, props.totalRecords, props.value?.length],
  () => nextTick(arabicizePaginatorDigits),
);
</script>

<style scoped>
.app-data-table-wrap :deep(.app-data-table) {
  background: transparent;
}

.app-data-table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.app-data-table-scroll::-webkit-scrollbar {
  height: 8px;
}

.app-data-table-scroll::-webkit-scrollbar-track {
  background: #111111;
}

.app-data-table-scroll::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 999px;
}

.app-data-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #525252;
}

.app-data-table-wrap :deep(.p-datatable-table-container),
.app-data-table-wrap :deep(.p-datatable-wrapper),
.app-data-table-wrap :deep(.p-datatable-table) {
  background: #111111 !important;
  border: none !important;
  border-collapse: collapse !important;
}

.app-data-table-wrap :deep(.p-datatable-table) {
  table-layout: auto !important;
  width: max-content !important;
  min-width: 100% !important;
}

.app-data-table-wrap :deep(.p-datatable-thead > tr > th),
.app-data-table-wrap :deep(.p-datatable-tbody > tr > td) {
  background: transparent !important;
  color: #e5e5e5 !important;
  border: none !important;
  border-bottom: 1px solid #262626 !important;
  padding: 0.85rem 0.75rem !important;
  text-align: center !important;
  vertical-align: middle !important;
  font-size: 0.875rem !important;
  box-shadow: none !important;
  white-space: nowrap;
}

.app-data-table-wrap :deep(.p-datatable-thead > tr > th) {
  background: #1a1a1a !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr) {
  background: #111111 !important;
  color: #e5e5e5 !important;
  transition: background-color 0.15s ease;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none !important;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr:hover > td),
.app-data-table-wrap :deep(.p-datatable-tbody > tr.p-datatable-row-odd:hover > td) {
  background: #1a1a1a !important;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr.p-datatable-row-odd > td) {
  background: #0a0a0a !important;
}

/* Expansion rows must wrap and use full width — not table cell nowrap/center rules */
.app-data-table-wrap :deep(.p-datatable-tbody > tr.p-datatable-row-expansion > td),
.app-data-table-wrap :deep(.p-datatable-tbody > tr[data-p-expansion-row="true"] > td) {
  white-space: normal !important;
  text-align: start !important;
  vertical-align: top !important;
  padding: 0.75rem !important;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr.app-row-matched > td) {
  background: rgba(245, 175, 82, 0.12) !important;
}

.app-data-table-wrap :deep(.p-datatable-empty-message > td),
.app-data-table-wrap :deep(.p-datatable-emptymessage > td) {
  text-align: center !important;
  color: #a3a3a3 !important;
  padding: 2.5rem 1rem !important;
  border: none !important;
  border-bottom: none !important;
  border-top: none !important;
  background: #111111 !important;
  box-shadow: none !important;
  white-space: normal;
}

.app-data-table-empty {
  text-align: center;
  color: #a3a3a3;
  font-size: 0.875rem;
  padding: 0.5rem 0;
}

.app-data-table-wrap :deep(.p-paginator) {
  background: #111111 !important;
  border: none !important;
  border-top: 1px solid #262626 !important;
  color: #e5e5e5 !important;
  padding: 0.75rem !important;
  justify-content: center;
  position: sticky;
  left: 0;
  min-width: 100%;
}

.app-data-table-wrap :deep(.p-paginator .p-paginator-page),
.app-data-table-wrap :deep(.p-paginator .p-paginator-prev),
.app-data-table-wrap :deep(.p-paginator .p-paginator-next),
.app-data-table-wrap :deep(.p-paginator .p-paginator-first),
.app-data-table-wrap :deep(.p-paginator .p-paginator-last) {
  background: transparent !important;
  color: #d4d4d4 !important;
  border: 1px solid transparent !important;
  min-width: 2.25rem;
  height: 2.25rem;
}

.app-data-table-wrap :deep(.p-paginator .p-paginator-page.p-highlight) {
  background: #1a1a1a !important;
  color: #fafafa !important;
  border-color: #404040 !important;
}
</style>

<!-- Unscoped so Aura theme cannot beat header flex alignment -->
<style>
.app-data-table-wrap .p-datatable-thead > tr > th {
  text-align: center !important;
}

.app-data-table-wrap .p-datatable-column-header-content,
.app-data-table-wrap [data-pc-section="columnheadercontent"] {
  display: flex !important;
  width: 100% !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 0.25rem;
}

.app-data-table-wrap .p-datatable-column-title,
.app-data-table-wrap [data-pc-section="columntitle"] {
  display: inline-block !important;
  width: auto !important;
  text-align: center !important;
  margin: 0 auto !important;
}

.app-data-table-wrap .p-datatable-tbody > tr > td {
  text-align: center !important;
}

.app-data-table-wrap .p-datatable-tbody > tr > td > * {
  margin-left: auto !important;
  margin-right: auto !important;
}

.app-data-table-wrap .p-datatable-tbody > tr.p-datatable-row-expansion > td,
.app-data-table-wrap .p-datatable-tbody > tr[data-p-expansion-row="true"] > td {
  text-align: start !important;
  white-space: normal !important;
}

.app-data-table-wrap .p-datatable-tbody > tr.p-datatable-row-expansion > td > *,
.app-data-table-wrap .p-datatable-tbody > tr[data-p-expansion-row="true"] > td > * {
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100%;
  max-width: 100%;
}
</style>
