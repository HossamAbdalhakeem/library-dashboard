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
        <span v-if="data?.inventoryItems?.length > 3" class="text-xs font-medium text-primary-600">
          +{{ data.inventoryItems.length - 3 }} منتج آخر
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
          @click="$emit('remove-stock', data)"
        />
      </div>
    </template>

    <template #expansion="{ data }">
      <div class="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <p class="mb-3 text-sm font-semibold text-slate-100">مخزون الفرع</p>
        <AppDataTable
          :value="data.inventoryItems || []"
          :columns="inventoryColumns"
          empty-message="لا توجد كميات مسجلة لهذا الفرع."
        >
          <template #reservedQuantity="{ data: item }">
            <AppStatusTableCell
              :label="String(item.reservedQuantity ?? 0)"
              severity="warn"
            />
          </template>
          <template #availableQuantity="{ data: item }">
            <AppStatusTableCell
              :label="String(item.availableQuantity ?? 0)"
              severity="success"
            />
          </template>
          <template #soldQuantity="{ data: item }">
            <AppStatusTableCell
              :label="String(item.soldQuantity ?? 0)"
              severity="primary"
            />
          </template>
          <template #stockAlert="{ data: item }">
            <AppStatusTableCell
              :label="` ${item.lowStockThreshold}`"
              severity="danger"
            />
          </template>
        </AppDataTable>
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

const expandedRows = ref({});

const columns = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "name", header: "اسم الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "inventory", header: "المنتجات بالكميات", slot: "inventory" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 16rem" },
];

const inventoryColumns = [
  { field: "productName", header: "المنتج" },
  { field: "physicalQuantity", header: "الكمية الفعلية" },
  {
    field: "reservedQuantity",
    header: "المحجوز",
    slot: "reservedQuantity",
  },
 
  {
    field: "soldQuantity",
    header: "المباع",
    slot: "soldQuantity",
  },
  {
    field: "availableQuantity",
    header: "المتاح",
    slot: "availableQuantity",
  },
  {
    field: "isLowStock",
    header: "تنبيه المخزون",
    slot: "stockAlert",
  },
];
</script>
