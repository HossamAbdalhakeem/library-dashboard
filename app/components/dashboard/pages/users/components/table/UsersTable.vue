<template>
  <AppDataTable
    :value="users"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="20"
    empty-message="لا يوجد مستخدمون."
  >
    <template #status="{ data }">
      <AppStatusTableCell
        kind="entity"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>
    <template #actions="{ data }">
      <Button
        v-if="canEdit(data)"
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
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import { isAdminRole } from "~/enums/userRole";

defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);

const canEdit = (user) => !isAdminRole(user?.role);

const columns = [
  { field: "fullName", header: "الاسم" },
  { field: "email", header: "البريد" },
  { field: "roleLabel", header: "الدور" },
  { field: "branchName", header: "الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>
