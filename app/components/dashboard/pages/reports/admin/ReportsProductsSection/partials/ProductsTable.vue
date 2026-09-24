<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rowsPerPage"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا توجد بيانات منتجات خلال الفترة المحددة."
    @page="$emit('page', $event)"
  />
</template>

<script setup>
defineOptions({ name: "ProductsTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowsPerPage: { type: Number, default: 10 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["page"]);

const columns = [
  { field: "productName", header: "المنتج" },
  { field: "quantitySold", header: "الكمية المباعة" },
  { field: "salesAmountLabel", header: "المبيعات" },
  { field: "profitLabel", header: "الربح" },
  { field: "remainingQuantity", header: "المتبقي حالياً" },
];
</script>
