<template>
  <div class="w-full min-w-0 space-y-6 overflow-x-hidden text-right" dir="rtl">
    <div class="flex w-full min-w-0 flex-col gap-3">
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-white">التقارير</h2>
        <p class="mt-1 text-sm text-slate-400">
          ملخص المبيعات والأرباح والمصروفات والحجوزات
        </p>
      </div>
      <ReportsFilters
        v-model:book="selectedBook"
        v-model:branch="selectedBranch"
        v-model:teacher="selectedTeacher"
        v-model:study-year="selectedStudyYear"
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
    <ReportsBranchesSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('branches', $event)"
    />
  </div>
</template>

<script setup>
import ReportsFilters from "~/components/dashboard/pages/reports/admin/ReportsFilters/ReportsFilters.vue";
import { useAcademicYear } from "~/composables/useAcademicYear";
import {
  buildReportDateRangeParams,
  todayInputValue,
} from "~/services/reports/shared";

const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsSummaryCards/ReportsSummaryCards.vue"),
);
const ReportsRevenueSection = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsRevenueSection/ReportsRevenueSection.vue"),
);
const ReportsSalesTrendSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsSalesTrendSection/ReportsSalesTrendSection.vue"
  ),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsFinancialsSection/ReportsFinancialsSection.vue"
  ),
);
const ReportsPaymentsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsPaymentsSection/ReportsPaymentsSection.vue"),
);
const ReportsBranchesSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsBranchesSection/ReportsBranchesSection.vue"),
);
const ReportsReturnsExchangesSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsReturnsExchangesSection/ReportsReturnsExchangesSection.vue"
  ),
);
const ReportsExpensesSection = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsExpensesSection/ReportsExpensesSection.vue"),
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
  return allowed.includes(raw) ? raw : "day";
};

/** Map UI period presets to backend sales-trend granularity hints. */
const apiPeriod = (value) => {
  const period = normalizePeriod(value);
  if (period === "day") return "today";
  return period;
};

const today = todayInputValue();
const dateFrom = ref(today);
const dateTo = ref(today);
const selectedPeriod = ref("day");
const selectedBranch = ref("all");
const selectedBook = ref(null);
const selectedTeacher = ref(null);
const selectedStudyYear = ref(null);

const reloadKey = ref(0);
const sectionLoading = reactive({
  summary: false,
  revenue: false,
  salesTrend: false,
  profitLoss: false,
  payments: false,
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
  if (selectedTeacher.value) {
    extras.teacherId = selectedTeacher.value;
  }
  if (selectedStudyYear.value) {
    extras.studyYearId = selectedStudyYear.value;
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

  if (!dateFrom.value && !dateTo.value) {
    const fallback = todayInputValue();
    dateFrom.value = fallback;
    dateTo.value = fallback;
    selectedPeriod.value = "day";
  }
};

const ensureDateRange = () => {
  if (dateFrom.value && dateTo.value) return;
  const fallback = todayInputValue();
  dateFrom.value = dateFrom.value || fallback;
  dateTo.value = dateTo.value || dateFrom.value || fallback;
  selectedPeriod.value = "day";
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
