<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm"
    dir="rtl"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition-colors hover:bg-white/[0.03]"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      <div class="min-w-0">
        <p class="font-bold text-white">تفصيل النشاط</p>
        <p class="mt-0.5 text-xs text-slate-400">
          مبيعات مباشرة مقابل التسليم · الحجوزات · المرتجعات والأرباح
        </p>
      </div>
      <span
        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
      >
        <i
          class="pi text-sm transition-transform"
          :class="expanded ? 'pi-chevron-up' : 'pi-chevron-down'"
        />
      </span>
    </button>

    <div v-if="expanded" class="border-t border-white/10 p-4">
      <ReportsActivityBreakdownSectionSkeleton v-if="loading" />

      <ReportsSectionError
        v-else-if="error"
        :message="error"
        @retry="reload"
      />

      <template v-else-if="data">
        <div
          class="mb-3 flex flex-wrap gap-1 rounded-xl bg-white/[0.03] p-1"
          role="tablist"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            role="tab"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            "
            :aria-selected="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <ActivityBreakdownDetailRows :rows="activeRows" />
      </template>
    </div>
  </section>
</template>

<script setup>
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import { adminReportsApi } from "~/services/reports/admin";
import { formatMoney } from "~/utils/format/money";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsActivityBreakdownSectionSkeleton from "./skeletons/ReportsActivityBreakdownSectionSkeleton.vue";
import ActivityBreakdownDetailRows from "./partials/ActivityBreakdownDetailRows.vue";

defineOptions({ name: "ReportsActivityBreakdownSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const expanded = ref(false);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getActivityBreakdown(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    immediate: false,
    enabled: expanded,
    emit,
    errorMessage: "تعذر تحميل تفصيل النشاط.",
  },
);

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const tabs = [
  { id: "sales", label: "تفصيل المبيعات" },
  { id: "reservations", label: "الحجوزات" },
  { id: "ops", label: "مرتجعات وأرباح" },
];

const activeTab = ref("sales");

const breakdown = computed(() => data.value || {});

const activeRows = computed(() => {
  const sales = breakdown.value.sales || {};
  const reservations = breakdown.value.reservations || {};
  const operations = breakdown.value.operations || {};

  if (activeTab.value === "reservations") {
    return [
      {
        label: "حجوزات جديدة",
        value: String(reservations.totalReservations ?? 0),
        hint: "عدد الحجوزات المنشأة في الفترة",
      },
      {
        label: "عربون الحجوزات المفتوحة",
        value: formatMoney(reservations.reservationDeposits, "locale"),
        hint: "مدفوعات على حجوزات لم تُسلَّم بعد",
      },
      {
        label: "مدفوعات الحجوزات الجديدة",
        value: formatMoney(reservations.reservationPayments, "locale"),
        hint: "ما دُفع على الحجوزات المنشأة في الفترة",
      },
      {
        label: "حجوزات ملغاة",
        value: String(reservations.cancelledReservationsCount ?? 0),
      },
      {
        label: "المبالغ المستحقة",
        value: formatMoney(reservations.outstandingAmount, "locale"),
        hint: "متبقي على الحجوزات المفتوحة",
      },
    ];
  }

  if (activeTab.value === "ops") {
    return [
      {
        label: "عدد المرتجعات",
        value: String(operations.returnsCount ?? 0),
        secondary: formatMoney(operations.returnsAmount, "locale"),
      },
      {
        label: "عدد الاستبدالات",
        value: String(operations.exchangesCount ?? 0),
      },
      {
        label: "إجمالي الاستردادات",
        value: formatMoney(operations.refundsTotal, "locale"),
      },
      {
        label: "إجمالي المصروفات",
        value: formatMoney(operations.totalExpenses, "locale"),
      },
      {
        label: "إجمالي الربح",
        value: formatMoney(operations.grossProfit, "locale"),
        hint: "صافي المبيعات − تكلفة البضاعة",
      },
      {
        label: "صافي الربح",
        value: formatMoney(operations.netProfit, "locale"),
        hint: "إجمالي الربح − المصروفات",
      },
    ];
  }

  return [
    {
      label: "مبيعات مباشرة",
      value: formatMoney(sales.directSalesAmount, "locale"),
      secondary: `${sales.directSalesCount ?? 0} عملية`,
      hint: "بيع بدون حجز",
    },
    {
      label: "تسليم حجوزات",
      value: formatMoney(sales.deliverySalesAmount, "locale"),
      secondary: `${sales.deliveryCount ?? 0} تسليم`,
      hint: "قيمة البيع الكاملة عند التسليم",
    },
    {
      label: "محصّل عند التسليم",
      value: formatMoney(sales.deliveryPaymentsAmount, "locale"),
      hint: "المتبقي المحصّل يوم التسليم",
    },
    {
      label: "عدد المبيعات الكلي",
      value: String(sales.salesCount ?? 0),
      hint: "مباشر + تسليم",
    },
  ];
});
</script>
