<template>
  <AppDataTable
    :value="teachers"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="20"
    empty-message="لا يوجد مدرسون."
  >
    <template #status="{ data }">
      <AppStatusTableCell
        kind="entity"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>
    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-1">
        <Button
          label="تعديل"
          icon="pi pi-pencil"
          text
          size="small"
          severity="primary"
          @click="$emit('edit', data)"
        />
        <Button
          v-if="data.status === 'INACTIVE'"
          label="تفعيل"
          icon="pi pi-check"
          text
          size="small"
          severity="success"
          :loading="activatingId === data.id"
          :disabled="Boolean(activatingId)"
          @click="$emit('activate', data)"
        />
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";

defineProps({
  teachers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  activatingId: { type: String, default: null },
});

defineEmits(["edit", "activate"]);

const columns = [
  { field: "name", header: "اسم المدرس" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 14rem" },
];
</script>
