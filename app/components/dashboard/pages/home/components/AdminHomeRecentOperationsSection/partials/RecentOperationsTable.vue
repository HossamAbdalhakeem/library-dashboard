<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    empty-message="لا توجد عمليات حديثة."
    :skeleton-rows="5"
  >
    <template #time="{ data }">
      <AppDatetimeTableCell :value="data.time" />
    </template>
    <template #type="{ data }">
      <AppStatusTableCell
        :kind="resolveTypeKind(data.typeKey)"
        :code="data.typeKey"
        :label="data.typeLabel"
      />
    </template>
    <template #amount="{ data }">
      <span class="text-sm font-semibold" :class="data.amountClass">
        {{ data.amountLabel }}
      </span>
    </template>
    <template #branch="{ data }">
      <span
        class="inline-flex max-w-full truncate rounded-lg bg-primary-500/10 px-2 py-1 text-xs font-medium text-primary-300"
      >
        {{ data.branch }}
      </span>
    </template>
  </AppDataTable>
</template>

<script setup>
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineOptions({ name: "RecentOperationsTable" });

defineProps({
  rows: { type: Array, default: () => [] },
});

const RESERVATION_TYPE_KEYS = new Set([
  "DELIVERED",
  "CANCELLED",
  "READY",
  "PENDING",
  "WAITING_FOR_STOCK",
]);

const columns = [
  { field: "id", header: "#" },
  { field: "time", header: "الوقت", slot: "time" },
  { field: "type", header: "النوع", slot: "type" },
  { field: "student", header: "اسم الطالب" },
  { field: "product", header: "المنتج" },
  { field: "amount", header: "المبلغ", slot: "amount" },
  { field: "branch", header: "الفرع", slot: "branch" },
];

const resolveTypeKind = (type) => {
  const key = String(type || "").toUpperCase();
  return RESERVATION_TYPE_KEYS.has(key) ? "reservation" : "transaction";
};
</script>
