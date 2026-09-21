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
import { storeToRefs } from "pinia";
import ReportsFilters from "~/components/dashboard/pages/reports/admin/ReportsFilters/index.vue";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { useAcademicYearStore } from "~/store/academicYear.js";

const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsSummaryCards/index.vue"),
);
const ReportsRevenueSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsRevenueSection/index.vue"),
);
const ReportsSalesTrendSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsSalesTrendSection/index.vue"
  ),
);
const ReportsInventoryTable = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsInventoryTable/index.vue"),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsFinancialsSection/index.vue"
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
    "~/components/dashboard/pages/reports/admin/ReportsReturnsExchangesSection/index.vue"
  ),
);
const ReportsExpensesSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsExpensesSection/index.vue"),
);

defineOptions({ name: "AdminReportsPage" });

const route = useRoute();
const router = useRouter();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();
const academicYearStore = useAcademicYearStore();
const { years: academicYears } = storeToRefs(academicYearStore);

const toDateInput = (value) => {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayInputValue = () => toDateInput(new Date()) || "2026-01-01";

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

const academicYearRange = computed(() => {
  const id = currentAcademicYearId.value;
  if (!id) return null;
  const match = academicYears.value.find(
    (year) => String(year.id) === String(id),
  );
  if (!match) return null;
  const from = toDateInput(match.startDate);
  const to = toDateInput(match.endDate);
  if (!from || !to) return null;
  return { from, to };
});

const today = todayInputValue();
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
  const fromBase = dateFrom.value || dateTo.value || todayInputValue();
  const toBase = dateTo.value || dateFrom.value || todayInputValue();
  const from = new Date(`${fromBase}T00:00:00`);
  const to = new Date(`${toBase}T23:59:59.999`);
  const params = {
    from: from.toISOString(),
    to: to.toISOString(),
    period: apiPeriod(selectedPeriod.value),
  };
  if (selectedBranch.value && selectedBranch.value !== "all") {
    params.branchId = selectedBranch.value;
  }
  if (selectedBook.value) {
    params.productId = selectedBook.value;
  }
  if (currentAcademicYearId.value) {
    params.academicYearId = String(currentAcademicYearId.value);
  }
  return params;
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
  if (dateFrom.value && dateTo.value) return;
  if (academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
    selectedPeriod.value = "year";
  } else {
    dateFrom.value = today;
    dateTo.value = today;
    selectedPeriod.value = "day";
  }
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
