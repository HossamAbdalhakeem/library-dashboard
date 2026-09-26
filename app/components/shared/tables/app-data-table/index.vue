<template>
  <div
    ref="wrapRef"
    class="app-data-table-wrap overflow-hidden rounded-xl border border-white/10 bg-[var(--app-card)]"
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
import { useAppDataTable } from "./composables/useAppDataTable";

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

const {
  wrapRef,
  tableAttrs,
  resolvedColumns,
  resolvedTableStyle,
  hasCustomBody,
  resolveCell,
  onPage,
  onRowExpand,
} = useAppDataTable(props, emit);
</script>

<style scoped src="./styles/app-data-table.scoped.css"></style>
<style src="./styles/app-data-table.theme.css"></style>
