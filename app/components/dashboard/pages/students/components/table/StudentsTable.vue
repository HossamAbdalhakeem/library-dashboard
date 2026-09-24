<template>
  <AppDataTable
    :value="students"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا يوجد طلاب."
    @page="$emit('page', $event)"
  >
    <template #student="{ data }">
      <AppStudentTableCell
        :student="{ name: data.name, phone: data.phone }"
      />
    </template>
    <template #status="{ data }">
      <AppStatusTableCell
        kind="entity"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>
    <template #actions="{ data }">
      <StudentsTableActions
        :student="data"
        :loading="deactivating"
        @transactions="$emit('transactions', $event)"
        @edit="$emit('edit', $event)"
        @deactivate="$emit('deactivate', $event)"
      />
    </template>
  </AppDataTable>
</template>

<script setup>
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import StudentsTableActions from "~/components/dashboard/pages/students/components/partials/StudentsTableActions.vue";

defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  deactivating: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["edit", "deactivate", "transactions", "page"]);

const columns = [
  { field: "name", header: "الطالب", slot: "student" },
  { field: "studyYearName", header: "السنة الدراسية" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>
