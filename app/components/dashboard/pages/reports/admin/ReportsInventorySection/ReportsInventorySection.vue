<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="font-bold text-[var(--app-text-strong)]">مخزون المنتجات</p>
      <Button
        label="تصدير"
        icon="pi pi-file-excel"
        severity="secondary"
        size="small"
        :loading="exporting"
        :disabled="loading || exporting || !hasRows"
        @click="onExport"
      />
    </div>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 4" :key="`inv-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل مخزون المنتجات."
      @retry="reload"
    />

    <p v-else-if="!hasRows" class="text-sm text-slate-500">
      لا توجد كميات مسجلة.
    </p>

    <div v-else class="space-y-6">
      <div v-for="branch in branches" :key="branch.branchId" class="space-y-2">
        <p class="font-semibold text-white">{{ branch.branchName }}</p>
        <InventoryProductsTable :rows="branch.rows" show-threshold />
      </div>

      <div v-if="productRows.length" class="space-y-2">
        <p class="font-semibold text-white">كل الفروع حسب المنتج</p>
        <InventoryProductsTable :rows="productRows" />
      </div>
    </div>
  </section>
</template>

<script setup>
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import { useAppToast } from "~/composables/useAppToast";
import { triggerBlobDownload } from "~/composables/useEntityExport";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import InventoryProductsTable from "./partials/InventoryProductsTable.vue";

defineOptions({ name: "ReportsInventorySection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);
const { showError, showSuccess } = useAppToast();
const exporting = ref(false);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getInventoryByProduct(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل مخزون المنتجات.",
  },
);

const toProductRow = (product) => ({
  productCell: {
    name: product.name,
    price: Number(product.price) > 0 ? formatMoney(product.price) : null,
    teacherName: product.teacherName || null,
    studyYearName: product.studyYearName || null,
  },
  physicalQuantity: product.physicalQuantity,
  reservedQuantity: product.reservedQuantity,
  availableQuantity: product.availableQuantity,
  lowStockThreshold: product.lowStockThreshold,
});

const branches = computed(() =>
  (Array.isArray(data.value?.branches) ? data.value.branches : []).map(
    (branch) => ({
      branchId: branch.branchId,
      branchName: branch.branchName,
      rows: (branch.products || []).map(toProductRow),
    }),
  ),
);

const productRows = computed(() =>
  (Array.isArray(data.value?.productsByProduct)
    ? data.value.productsByProduct
    : []
  ).map(toProductRow),
);

const hasRows = computed(() => branches.value.length > 0);

const onExport = async () => {
  if (exporting.value || !hasRows.value) return;
  exporting.value = true;
  try {
    const blob = await adminReportsApi.exportInventoryByProduct(props.params);
    triggerBlobDownload(blob, "inventory-by-product.xls");
    showSuccess("تم تصدير مخزون المنتجات بنجاح.");
  } catch (err) {
    if (err?.code !== "SESSION_CLEARED" && err?.status !== 401) {
      showError(err?.message || "تعذر تصدير مخزون المنتجات.");
    }
  } finally {
    exporting.value = false;
  }
};
</script>
