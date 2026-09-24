<template>
  <div class="w-full min-w-0 space-y-8 overflow-x-hidden text-right" dir="rtl">
    <div>
      <h2 class="text-xl font-bold text-white">الرئيسية</h2>
      <p class="mt-1 text-sm text-slate-400">
        نظرة عامة على النظام مع اختصارات سريعة للصفحات والعمليات
      </p>
    </div>

    <AdminHomeKpiSection />

    <div class="w-full min-w-0 space-y-4 overflow-x-hidden">
      <ReportsSummaryCards
        :params="reportParams"
        :reload-key="reloadKey"
      />
      <ReportsRevenueSection
        :params="reportParams"
        :reload-key="reloadKey"
      />
      <ReportsReturnsExchangesSection
        :params="reportParams"
        :reload-key="reloadKey"
      />
      <ReportsFinancialsSection
        :params="reportParams"
        :reload-key="reloadKey"
      />
      <ReportsExpensesSection
        :params="reportParams"
        :reload-key="reloadKey"
      />
      <ReportsInventoryTable
        :params="reportParams"
        :reload-key="reloadKey"
      />
    </div>

    <AdminHomeSalesTrendCard />
    <AdminHomeActionsSection />
    <AdminHomeInsightsSection />
    <AdminHomeRecentOperationsSection />
  </div>
</template>

<script setup>
import { useAcademicYear } from "~/composables/useAcademicYear";
import {
  buildReportDateRangeParams,
  fillMissingDateRange,
} from "~/services/reports/shared";

defineOptions({ name: "AdminHomePageIndex" });

const AdminHomeSalesTrendCard = defineAsyncComponent(() =>
  import("./components/AdminHomeSalesTrendCard/AdminHomeSalesTrendCard.vue"),
);
const AdminHomeKpiSection = defineAsyncComponent(() =>
  import("./components/AdminHomeKpiSection/AdminHomeKpiSection.vue"),
);
const AdminHomeActionsSection = defineAsyncComponent(() =>
  import("./components/AdminHomeActionsSection/AdminHomeActionsSection.vue"),
);
const AdminHomeInsightsSection = defineAsyncComponent(() =>
  import("./components/AdminHomeInsightsSection/AdminHomeInsightsSection.vue"),
);
const AdminHomeRecentOperationsSection = defineAsyncComponent(() =>
  import("./components/AdminHomeRecentOperationsSection/AdminHomeRecentOperationsSection.vue"),
);
const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsSummaryCards/ReportsSummaryCards.vue"),
);
const ReportsRevenueSection = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsRevenueSection/ReportsRevenueSection.vue"),
);
const ReportsReturnsExchangesSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsReturnsExchangesSection/ReportsReturnsExchangesSection.vue"
  ),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import(
    "~/components/shared/admin-page/ReportsFinancialsSection/ReportsFinancialsSection.vue"
  ),
);
const ReportsExpensesSection = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsExpensesSection/ReportsExpensesSection.vue"),
);
const ReportsInventoryTable = defineAsyncComponent(() =>
  import("~/components/shared/admin-page/ReportsInventoryTable/ReportsInventoryTable.vue"),
);

const {
  academicYearId: currentAcademicYearId,
  academicYearStore,
  academicYearRange,
} = useAcademicYear();

const dateFrom = ref(null);
const dateTo = ref(null);
const reloadKey = ref(0);

const reportParams = computed(() =>
  buildReportDateRangeParams({
    from: dateFrom.value,
    to: dateTo.value,
    academicYearId: currentAcademicYearId.value,
    extras: { period: "year" },
  }),
);

const ensureDateRange = () => {
  const filled = fillMissingDateRange({
    from: dateFrom.value,
    to: dateTo.value,
    academicYearRange: academicYearRange.value,
  });
  dateFrom.value = filled.from;
  dateTo.value = filled.to;
};

watch(currentAcademicYearId, () => {
  if (academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
    reloadKey.value += 1;
  }
});

onMounted(async () => {
  await academicYearStore.fetchYears().catch(() => {});
  ensureDateRange();
});
</script>
