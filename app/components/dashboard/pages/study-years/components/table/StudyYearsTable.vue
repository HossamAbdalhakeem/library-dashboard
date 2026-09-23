<template>
  <AppDataTable
    :value="studyYears"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="20"
    empty-message="لا توجد سنوات دراسية."
  >
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

defineProps({
  studyYears: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);

const columns = [
  { field: "name", header: "الاسم" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>
