<template>
  <div class="overflow-hidden rounded-xl border border-white/5">
    <AppDataTable
      :value="rows"
      :columns="columns"
      empty-message="لا توجد مصروفات حسب الفرع."
    />
  </div>
</template>

<script setup>
defineOptions({ name: "ExpensesByBranchTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineProps({
  rows: { type: Array, default: () => [] },
});

const columns = [
  { field: "branchName", header: "الفرع" },
  { field: "categoryName", header: "النوع" },
  { field: "amountLabel", header: "المبلغ" },
];
</script>
