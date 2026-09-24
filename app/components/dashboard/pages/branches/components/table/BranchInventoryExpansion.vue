<template>
  <div class="rounded-xl border border-slate-700 bg-slate-900 p-4">
    <p class="mb-3 text-sm font-semibold text-slate-100">مخزون الفرع</p>
    <AppDataTable
      :value="items"
      :columns="inventoryColumns"
      :loading="loading"
      paginator
      lazy
      :rows="pagination.perPage"
      :first="pagination.first"
      :total-records="pagination.total"
      empty-message="لا توجد كميات مسجلة لهذا الفرع."
      @page="onPage"
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

<script setup>
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import { inventoryApi } from "~/services/inventory";
import { normalizeInventoryItem } from "~/services/branch";
import { useAppToast } from "~/composables/useAppToast";

const props = defineProps({
  branchId: { type: String, required: true },
});

const { showError } = useAppToast();
const loading = ref(true);
const items = ref([]);
const pagination = reactive({
  page: 1,
  perPage: 10,
  total: 0,
  first: 0,
});

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

const loadInventory = async () => {
  loading.value = true;
  try {
    const result = await inventoryApi.getBranchInventoryPage(props.branchId, {
      page: pagination.page,
      perPage: pagination.perPage,
    });
    items.value = (result.data || []).map(normalizeInventoryItem);
    pagination.total = result.pagination?.total || 0;
  } catch (error) {
    showError(error?.message || "تعذر تحميل مخزون الفرع.");
    items.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  loadInventory();
};

onMounted(loadInventory);
</script>
