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
    <template #location="{ data }">
      <span :class="data.locationLabel === 'غير محدد' ? 'text-slate-400' : ''">
        {{ data.locationLabel }}
      </span>
    </template>

    <template #radius="{ data }">
      {{ data.radiusLabel }}
    </template>

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
          @click="$emit('remove-stock', data)"
        />
        <Button
          icon="pi pi-exclamation-triangle"
          rounded
          text
          severity="danger"
          class="!h-11 !w-11 !text-xl"
          title="إخراج التالف"
          aria-label="إخراج التالف"
          @click="$emit('remove-damaged', data)"
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

defineEmits(["edit", "add-stock", "remove-stock", "remove-damaged"]);

const columns = [
  { field: "name", header: "اسم الفرع" },
  { field: "locationLabel", header: "الموقع", slot: "location" },
  { field: "radiusLabel", header: "النطاق", slot: "radius" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 18rem" },
];
</script>
