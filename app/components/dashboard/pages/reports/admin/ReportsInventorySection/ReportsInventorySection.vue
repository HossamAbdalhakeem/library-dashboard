<template>
  <section class="flex w-full min-w-0 flex-col gap-4" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
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

    <p v-if="!searched" class="text-sm text-slate-500">
      حدد الفلاتر ثم اضغط بحث.
    </p>

    <div v-else-if="loading" class="space-y-2">
      <Skeleton v-for="i in 4" :key="`inv-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل مخزون المنتجات."
      @retry="loadReport"
    />

    <p v-else-if="!hasRows" class="text-sm text-slate-500">
      لا توجد كميات مسجلة.
    </p>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="branch in branches"
        :key="branch.branchId"
        class="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
      >
        <p class="text-base font-semibold text-[var(--app-text-strong)]">
          {{ branch.branchName }}
        </p>
        <InventoryProductsTable :rows="branch.rows" show-threshold />
      </div>

      <div
        v-if="productRows.length"
        class="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
      >
        <p class="text-base font-semibold text-[var(--app-text-strong)]">
          كل الفروع حسب المنتج
        </p>
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
import { useAppToast } from "~/composables/useAppToast";
import { triggerBlobDownload } from "~/composables/useEntityExport";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import InventoryProductsTable from "./partials/InventoryProductsTable.vue";

defineOptions({ name: "ReportsInventorySection" });

const props = defineProps({
  params: { type: Object, default: null },
  searchKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);
const { showError, showSuccess } = useAppToast();
const exporting = ref(false);
const loading = ref(false);
const error = ref(null);
const branches = ref([]);
const productRows = ref([]);
let generation = 0;

const searched = computed(() => props.searchKey > 0);
const hasRows = computed(() => branches.value.length > 0);

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

const setLoading = (value) => {
  loading.value = value;
  emit("loading", value);
};

const loadReport = async () => {
  if (!props.params) return;
  const gen = ++generation;
  setLoading(true);
  error.value = null;
  try {
    const result = await adminReportsApi.getInventoryByProduct(props.params);
    if (gen !== generation) return;
    branches.value = (Array.isArray(result?.branches) ? result.branches : []).map(
      (branch) => ({
        branchId: branch.branchId,
        branchName: branch.branchName,
        rows: (branch.products || []).map(toProductRow),
      }),
    );
    productRows.value = (
      Array.isArray(result?.productsByProduct) ? result.productsByProduct : []
    ).map(toProductRow);
  } catch (err) {
    if (gen !== generation) return;
    branches.value = [];
    productRows.value = [];
    error.value = err?.message || "تعذر تحميل مخزون المنتجات.";
    if (err?.code !== "SESSION_CLEARED" && err?.status !== 401) {
      showError(error.value);
    }
  } finally {
    if (gen === generation) setLoading(false);
  }
};

const onExport = async () => {
  if (exporting.value || !hasRows.value || !props.params) return;
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

watch(
  () => props.searchKey,
  () => {
    if (!props.searchKey) return;
    loadReport();
  },
);
</script>
