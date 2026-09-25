<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-white">حركة المنتجات</p>
    <!-- <p class="mb-3 text-xs text-slate-400">
      صافي الفترة: مبيعات بتاريخ البيع − مرتجعات بتاريخ الإرجاع
    </p> -->

    <div v-if="loading && !rows.length" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`prod-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل حركة المنتجات."
      @retry="reload"
    />

    <ProductsTable
      v-else
      :rows="rows"
      :loading="loading"
      :rows-per-page="pagination.perPage"
      :first="pagination.first"
      :total-records="pagination.total"
      @page="onPage"
    />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import ProductsTable from "./partials/ProductsTable.vue";

defineOptions({ name: "ReportsProductsSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const pagination = reactive({
  page: 1,
  perPage: 10,
  total: 0,
  first: 0,
});

const resetPagination = () => {
  pagination.page = 1;
  pagination.first = 0;
};

const queryParams = computed(() => ({
  ...(props.params || {}),
  page: pagination.page,
  per_page: pagination.perPage,
}));

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getProducts(params),
  {
    params: queryParams,
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل حركة المنتجات.",
  },
);

const rows = computed(() =>
  (Array.isArray(data.value?.products) ? data.value.products : []).map(
    (row) => ({
      ...row,
      salesAmountLabel: formatMoney(row.salesAmount, "locale"),
      profitLabel: formatMoney(row.profit, "locale"),
    }),
  ),
);

watch(
  () => data.value?.pagination,
  (meta) => {
    if (!meta) return;
    pagination.total = Number(meta.total || 0);
    if (meta.current_page) pagination.page = Number(meta.current_page);
    if (meta.per_page) pagination.perPage = Number(meta.per_page);
  },
);

watch(
  () => [
    props.params?.from,
    props.params?.to,
    props.params?.branchId,
    props.params?.productId,
    props.params?.academicYearId,
    props.params?.period,
    props.reloadKey,
  ],
  () => {
    resetPagination();
  },
);

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
};
</script>
