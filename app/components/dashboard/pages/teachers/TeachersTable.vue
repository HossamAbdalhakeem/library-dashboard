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
      <AppStatusTag
        kind="entity"
        :code="data.status"
        :label="data.statusLabel"
      />
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
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";

defineProps({
  teachers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);

const columns = [
  { field: "name", header: "اسم المدرس" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>
