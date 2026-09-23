<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-white">حركة المنتجات</p>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`prod-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل حركة المنتجات."
      @retry="reload"
    />

    <ProductsTable v-else :rows="rows" />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ProductsTable from "./partials/ProductsTable.vue";

defineOptions({ name: "ReportsProductsSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getProducts(params),
  {
    params: toRef(props, "params"),
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
</script>
