<template>
  <div class="w-full min-w-0 space-y-6 overflow-x-hidden text-right" dir="rtl">
    <div class="flex w-full min-w-0 flex-col gap-3">
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-[var(--app-text-strong)]">
          التقارير
        </h2>
        <p class="mt-1 text-sm text-slate-400">
          ملخص المبيعات والأرباح والمصروفات
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
      controlled
      :summary="summaryData"
      :loading="summaryLoading"
      :error="summaryError || ''"
      @retry="reloadSummary"
    />

    <ReportsSalesSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('sales', $event)"
    />

    <ReportsReservationsSummarySection
      :summary="summaryData"
      :loading="summaryLoading"
      :error="summaryError || ''"
      @retry="reloadSummary"
    />
    <ReportsFinancialsSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('profitLoss', $event)"
    />
    <ReportsPaymentsSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('payments', $event)"
    />
    <ReportsSalesTrendSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('salesTrend', $event)"
    />
  </div>
</template>

<script setup>
import ReportsFilters from "~/components/dashboard/pages/reports/admin/ReportsFilters/ReportsFilters.vue";
import { useAdminReportFilters } from "~/composables/useAdminReportFilters";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import { adminReportsApi } from "~/services/reports/admin";

const ReportsSummaryCards = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsSummaryCards/ReportsSummaryCards.vue"
  )
);
const ReportsReservationsSummarySection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsReservationsSummarySection/ReportsReservationsSummarySection.vue"
  )
);
const ReportsSalesTrendSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsSalesTrendSection/ReportsSalesTrendSection.vue"
  )
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsFinancialsSection/ReportsFinancialsSection.vue"
  )
);
const ReportsPaymentsSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsPaymentsSection/ReportsPaymentsSection.vue"
  )
);
const ReportsSalesSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsSalesSection/ReportsSalesSection.vue"
  )
);

defineOptions({ name: "AdminReportsPageIndex" });

const route = useRoute();
const router = useRouter();
const {
  academicYearRange,
  dateFrom,
  dateTo,
  selectedPeriod,
  selectedBranch,
  selectedBook,
  selectedTeacher,
  selectedStudyYear,
  reloadKey,
  reportParams,
  refresh: refreshAll,
  onFiltersChange,
} = useAdminReportFilters();

const sectionLoading = reactive({
  summary: false,
  salesTrend: false,
  profitLoss: false,
  payments: false,
  sales: false,
});

const anyLoading = computed(() => Object.values(sectionLoading).some(Boolean));

const setSectionLoading = (key, value) => {
  sectionLoading[key] = Boolean(value);
};

const {
  loading: summaryLoading,
  data: summaryData,
  error: summaryError,
  reload: reloadSummary,
} = useAdminReportSection(
  (params) => adminReportsApi.getSummary(params),
  {
    params: reportParams,
    reloadKey,
    emit: (event, value) => {
      if (event === "loading") setSectionLoading("summary", value);
    },
    errorMessage: "تعذر تحميل بيانات المؤشرات.",
  },
);

onMounted(() => {
  if (Object.keys(route.query).length) {
    router.replace({ query: {} });
  }
});
</script>
