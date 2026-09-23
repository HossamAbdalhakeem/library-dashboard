<template>
  <div class="w-full min-w-0 space-y-6 overflow-x-hidden text-right" dir="rtl">
    <div class="flex w-full min-w-0 flex-col gap-3">
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-white">التقارير</h2>
        <p class="mt-1 text-sm text-slate-400">
          ملخص المبيعات والأرباح والمصروفات والحجوزات حسب الفلاتر
        </p>
      </div>
      <ReportsFilters
        v-model:book="selectedBook"
        v-model:branch="selectedBranch"
        v-model:from="dateFrom"
        v-model:to="dateTo"
        v-model:period="selectedPeriod"
        :academic-year-range="academicYearRange"
        :loading="anyLoading"
        class="w-full min-w-0"
        @change="onFiltersChange"
        @refresh="refreshAll"
      />
    </div>

    <ReportsSummaryCards
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('summary', $event)"
    />
    <ReportsRevenueSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('revenue', $event)"
    />
    <ReportsReturnsExchangesSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('returns', $event)"
    />
    <ReportsFinancialsSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('profitLoss', $event)"
    />
    <ReportsExpensesSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('expenses', $event)"
    />

    <ReportsSalesTrendSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('salesTrend', $event)"
    />
    <ReportsPaymentsSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('payments', $event)"
    />
    <ReportsInventoryTable
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('inventory', $event)"
    />
    <ReportsProductsSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('products', $event)"
    />
    <ReportsBranchesSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('branches', $event)"
    />
  </div>
</template>

<script setup>
import ReportsFilters from "~/components/dashboard/pages/reports/admin/ReportsFilters/index.vue";
import { useAcademicYear } from "~/composables/useAcademicYear";
import {
  buildReportDateRangeParams,
  fillMissingDateRange,
} from "~/services/reports/shared";

const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsSummaryCards/index.vue"),
);
const ReportsRevenueSection = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsRevenueSection/index.vue"),
);
const ReportsSalesTrendSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsSalesTrendSection/index.vue"
  ),
);
const ReportsInventoryTable = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsInventoryTable/index.vue"),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsFinancialsSection/index.vue"
  ),
);
const ReportsPaymentsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsPaymentsSection/index.vue"),
);
const ReportsProductsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsProductsSection/index.vue"),
);
const ReportsBranchesSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsBranchesSection/index.vue"),
);
const ReportsReturnsExchangesSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsReturnsExchangesSection/index.vue"
  ),
);
const ReportsExpensesSection = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsExpensesSection/index.vue"),
);

defineOptions({ name: "AdminReportsPageIndex" });

const route = useRoute();
const router = useRouter();
const {
  academicYearId: currentAcademicYearId,
  academicYearStore,
  academicYearRange,
} = useAcademicYear();

const normalizePeriod = (value) => {
  const allowed = ["day", "week", "month", "year", "custom"];
  const raw = String(value || "").toLowerCase();
  if (raw === "today") return "day";
  return allowed.includes(raw) ? raw : "year";
};

/** Map UI period presets to backend sales-trend granularity hints. */
const apiPeriod = (value) => {
  const period = normalizePeriod(value);
  if (period === "day") return "today";
  return period;
};

const dateFrom = ref(null);
const dateTo = ref(null);
const selectedPeriod = ref("year");
const selectedBranch = ref("all");
const selectedBook = ref(null);

const reloadKey = ref(0);
const sectionLoading = reactive({
  summary: false,
  revenue: false,
  salesTrend: false,
  profitLoss: false,
  payments: false,
  inventory: false,
  products: false,
  branches: false,
  returns: false,
  expenses: false,
});

const anyLoading = computed(() => Object.values(sectionLoading).some(Boolean));

const reportParams = computed(() => {
  const extras = {
    period: apiPeriod(selectedPeriod.value),
  };
  if (selectedBranch.value && selectedBranch.value !== "all") {
    extras.branchId = selectedBranch.value;
  }
  if (selectedBook.value) {
    extras.productId = selectedBook.value;
  }
  return buildReportDateRangeParams({
    from: dateFrom.value,
    to: dateTo.value,
    academicYearId: currentAcademicYearId.value,
    extras,
  });
});

const setSectionLoading = (key, value) => {
  sectionLoading[key] = Boolean(value);
};

const refreshAll = () => {
  reloadKey.value += 1;
};

const onFiltersChange = (payload) => {
  if (payload && typeof payload === "object") {
    if ("from" in payload) dateFrom.value = payload.from || null;
    if ("to" in payload) dateTo.value = payload.to || payload.from || null;
    if ("period" in payload) selectedPeriod.value = normalizePeriod(payload.period);
  }

  if (!dateFrom.value && !dateTo.value && academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
    selectedPeriod.value = "year";
  }
};

const ensureDateRange = () => {
  const filled = fillMissingDateRange({
    from: dateFrom.value,
    to: dateTo.value,
    academicYearRange: academicYearRange.value,
  });
  dateFrom.value = filled.from;
  dateTo.value = filled.to;
  if (filled.usedAcademicYear) selectedPeriod.value = "year";
  else if (filled.usedToday) selectedPeriod.value = "day";
};

watch(currentAcademicYearId, () => {
  if (academicYearRange.value && selectedPeriod.value === "year") {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
  }
});

onMounted(async () => {
  if (Object.keys(route.query).length) {
    router.replace({ query: {} });
  }
  await academicYearStore.fetchYears().catch(() => {});
  ensureDateRange();
});
</script>
