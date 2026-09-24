<template>
  <AppDataTable
    v-model:expandedRows="expandedRows"
    :value="branches"
    :columns="columns"
    :loading="loading"
    data-key="id"
    paginator
    :rows="20"
    empty-message="لا توجد فروع مسجلة."
    @row-expand="onRowExpand"
  >
    <template #status="{ data }">
      <AppStatusTableCell
        kind="entity"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>

    <template #inventory="{ data }">
      <span v-if="!data.productsCount" class="text-slate-400">لا توجد منتجات</span>
      <div v-else class="flex flex-col gap-1 text-right text-sm">
        <span
          v-for="item in (data.inventoryPreview || []).slice(0, 3)"
          :key="item.productId"
        >
          {{ item.productName }}:
          <strong>{{ item.physicalQuantity }}</strong>
        </span>
        <span
          v-if="moreProductsCount(data) > 0"
          class="text-xs font-medium text-primary-600"
        >
          +{{ moreProductsCount(data) }} منتج آخر
        </span>
      </div>
    </template>

    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-1">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          size="small"
          severity="primary"
          title="تعديل"
          aria-label="تعديل"
          @click="$emit('edit', data)"
        />
        <Button
          icon="pi pi-box"
          rounded
          text
          size="small"
          severity="success"
          title="إضافة منتج"
          aria-label="إضافة منتج"
          data-testid="branch-add-stock"
          @click="$emit('add-stock', data)"
        />
        <Button
          icon="pi pi-arrow-circle-up"
          rounded
          text
          size="small"
          severity="warning"
          title="سحب منتج"
          aria-label="سحب منتج"
          data-testid="branch-remove-stock"
          @click="$emit('remove-stock', data)"
        />
      </div>
    </template>

    <template #expansion="{ data }">
      <BranchInventoryExpansion
        v-if="isRowExpanded(data.id)"
        :branch-id="data.id"
      />
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";

const BranchInventoryExpansion = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/branches/components/table/BranchInventoryExpansion.vue"),
);

defineProps({
  branches: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit", "add-stock", "remove-stock"]);

const expandedRows = ref({});

const columns = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "name", header: "اسم الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "inventory", header: "المنتجات بالكميات", slot: "inventory" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 16rem" },
];

const moreProductsCount = (branch) => {
  const previewLen = (branch.inventoryPreview || []).length;
  return Math.max(0, Number(branch.productsCount || 0) - previewLen);
};

const isRowExpanded = (branchId) => Boolean(expandedRows.value?.[branchId]);

/** Only one expansion at a time — opening a row closes any other. */
const onRowExpand = (event) => {
  const branchId = event?.data?.id;
  if (!branchId) return;
  expandedRows.value = { [branchId]: true };
};
</script>
