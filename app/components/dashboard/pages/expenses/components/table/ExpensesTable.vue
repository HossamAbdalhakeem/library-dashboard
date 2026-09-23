<template>
  <AppDataTable
    :value="expenses"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا توجد مصروفات."
    @page="$emit('page', $event)"
  >
    <template #expenseDate="{ data }">
      <AppDatetimeTableCell :value="data.expenseDate" format="date" />
    </template>

    <template #actions="{ data }">
      <Button
        label="تعديل"
        icon="pi pi-pencil"
        text
        size="small"
        severity="primary"
        @click="$emit('edit', data)"
      />
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";

defineProps({
  expenses: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["edit", "page"]);

const columns = [
  { field: "categoryName", header: "التصنيف" },
  { field: "branchName", header: "الفرع" },
  { field: "amountLabel", header: "المبلغ" },
  { field: "expenseDate", header: "التاريخ", slot: "expenseDate" },
  { field: "description", header: "الوصف", fallback: "-" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>
