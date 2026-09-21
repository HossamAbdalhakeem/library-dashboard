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
import { storeToRefs } from "pinia";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { useAcademicYearStore } from "~/store/academicYear.js";

defineOptions({ name: "AdminHomePage" });

const AdminHomeSalesTrendCard = defineAsyncComponent(() =>
  import("./AdminHomeSalesTrendCard/index.vue"),
);
const AdminHomeKpiSection = defineAsyncComponent(() =>
  import("./AdminHomeKpiSection/index.vue"),
);
const AdminHomeActionsSection = defineAsyncComponent(() =>
  import("./AdminHomeActionsSection/index.vue"),
);
const AdminHomeInsightsSection = defineAsyncComponent(() =>
  import("./AdminHomeInsightsSection/index.vue"),
);
const AdminHomeRecentOperationsSection = defineAsyncComponent(() =>
  import("./AdminHomeRecentOperationsSection/index.vue"),
);
const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsSummaryCards/index.vue"),
);
const ReportsRevenueSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsRevenueSection/index.vue"),
);
const ReportsReturnsExchangesSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsReturnsExchangesSection/index.vue"
  ),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsFinancialsSection/index.vue"
  ),
);
const ReportsExpensesSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsExpensesSection/index.vue"),
);
const ReportsInventoryTable = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsInventoryTable/index.vue"),
);

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

const dateFrom = ref(null);
const dateTo = ref(null);
const reloadKey = ref(0);

const reportParams = computed(() => {
  const fromBase = dateFrom.value || dateTo.value || todayInputValue();
  const toBase = dateTo.value || dateFrom.value || todayInputValue();
  const from = new Date(`${fromBase}T00:00:00`);
  const to = new Date(`${toBase}T23:59:59.999`);
  const params = {
    from: from.toISOString(),
    to: to.toISOString(),
    period: "year",
  };
  if (currentAcademicYearId.value) {
    params.academicYearId = String(currentAcademicYearId.value);
  }
  return params;
});

const ensureDateRange = () => {
  if (dateFrom.value && dateTo.value) return;
  if (academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
  } else {
    const today = todayInputValue();
    dateFrom.value = today;
    dateTo.value = today;
  }
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
