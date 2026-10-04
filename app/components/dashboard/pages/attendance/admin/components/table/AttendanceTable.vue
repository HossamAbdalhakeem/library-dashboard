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
    empty-message="لا توجد سجلات حضور."
    @page="$emit('page', $event)"
  >
    <template #workDate="{ data }">
      {{ data.workDateLabel }}
    </template>
    <template #checkIn="{ data }">
      <span :class="data.checkInTime === '—' ? 'text-[var(--app-muted)]' : ''">
        {{ data.checkInTime }}
      </span>
    </template>
    <template #checkOut="{ data }">
      <span :class="data.checkOutTime === '—' ? 'text-[var(--app-muted)]' : ''">
        {{ data.checkOutTime }}
      </span>
    </template>
    <template #location="{ data }">
      <span class="text-sm">{{ data.locationLabel }}</span>
    </template>
    <template #actions="{ data }">
      <Button
        label="عرض"
        icon="pi pi-eye"
        text
        size="small"
        @click="$emit('open', data)"
      />
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";

defineOptions({ name: "AttendanceTable" });

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowsPerPage: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["page", "open"]);

const columns = [
  { field: "employeeName", header: "الموظف" },
  { field: "branchName", header: "الفرع" },
  { field: "workDateLabel", header: "التاريخ", slot: "workDate" },
  { field: "checkInTime", header: "الحضور", slot: "checkIn" },
  { field: "checkOutTime", header: "الانصراف", slot: "checkOut" },
  { field: "locationLabel", header: "حالة الموقع", slot: "location" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 7rem" },
];
</script>
