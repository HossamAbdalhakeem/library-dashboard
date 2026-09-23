<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    empty-message="لا توجد بيانات منتجات خلال الفترة المحددة."
  />
</template>

<script setup>
defineOptions({ name: "ProductsTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineProps({
  rows: { type: Array, default: () => [] },
});

const columns = [
  { field: "productName", header: "المنتج" },
  { field: "quantitySold", header: "الكمية المباعة" },
  { field: "salesAmountLabel", header: "المبيعات" },
  { field: "profitLabel", header: "الربح" },
  { field: "remainingQuantity", header: "المتبقي" },
];
</script>
