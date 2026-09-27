<template>
  <AppDataTable
    :value="branches"
    :columns="columns"
    :loading="loading"
    data-key="id"
    paginator
    :rows="20"
    empty-message="لا توجد فروع مسجلة."
  >
    <template #status="{ data }">
      <AppStatusTableCell
        kind="entity"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>

    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="primary"
          class="!h-11 !w-11 !text-xl"
          title="تعديل"
          aria-label="تعديل"
          @click="$emit('edit', data)"
        />
        <Button
          icon="pi pi-plus"
          rounded
          text
          severity="success"
          class="!h-11 !w-11 !text-xl"
          title="إضافة منتج"
          aria-label="إضافة منتج"
          data-testid="branch-add-stock"
          @click="$emit('add-stock', data)"
        />
        <Button
          icon="pi pi-minus"
          rounded
          text
          severity="warning"
          class="!h-11 !w-11 !text-xl"
          title="سحب منتج"
          aria-label="سحب منتج"
          data-testid="branch-remove-stock"
          @click="$emit('remove-stock', data)"
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
  branches: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit", "add-stock", "remove-stock"]);

const columns = [
  { field: "name", header: "اسم الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 16rem" },
];
</script>
