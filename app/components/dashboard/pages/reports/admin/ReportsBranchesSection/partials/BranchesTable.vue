<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    empty-message="لا توجد بيانات فروع خلال الفترة المحددة."
  />
</template>

<script setup>
defineOptions({ name: "BranchesTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineProps({
  rows: { type: Array, default: () => [] },
});

const columns = [
  { field: "branchName", header: "الفرع" },
  { field: "salesLabel", header: "المبيعات" },
  { field: "salesCount", header: "عدد العمليات" },
  { field: "reservations", header: "الحجوزات" },
  { field: "returnsLabel", header: "المرتجعات" },
  { field: "expensesLabel", header: "المصروفات" },
  { field: "netSalesLabel", header: "صافي المبيعات" },
];
</script>
