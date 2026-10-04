<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-[var(--app-text-strong)]">المبيعات</p>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="i in cards.length" :key="`ret-${i}`" height="7.5rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات المبيعات."
      @retry="reload"
    />

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <ReportsPairedMetricCard
        v-for="card in cards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :accent="card.accent"
        :icon="card.icon"
        :hint="card.hint"
        :rows="card.rows"
      />
    </div>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsPairedMetricCard from "~/components/shared/admin-page/ReportsFinancialsSection/partials/ReportsPairedMetricCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";

defineOptions({ name: "ReportsSalesSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getSales(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المبيعات.",
  },
);

const stats = computed(() => data.value || {});

const count = (value) => value ?? 0;
const amount = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};
const money = (value) => formatMoney(value, "locale");

const cards = computed(() => {
  const statsValue = stats.value;
  const totalRefunded =
    amount(statsValue.refundedAmount) + amount(statsValue.exchangeRefundAmount);

  return [
    {
      key: "sales",
      label: "عدد المبيعات",
      value: count(statsValue.salesCount),
      accent: "sky",
      icon: "pi-shopping-cart",
      hint: "مبيعات مكتملة، وتشمل تسليم الحجز",
      rows: [
        {
          label: "إجمالي المبيعات",
          value: money(statsValue.grossSales),
          hint: "سعر البيع قبل المرتجعات",
        },
        {
          label: "صافي المبيعات",
          value: money(statsValue.netSales),
          hint: "بعد خصم قيمة المرتجعات",
        },
      ],
    },
    {
      key: "returns",
      label: "عدد المرتجعات",
      value: count(statsValue.returnsCount),
      accent: "rose",
      icon: "pi-box",
      rows: [
        {
          label: "عدد القطع المرتجعة",
          value: count(statsValue.returnedItemsCount),
        },
        {
          label: "المبلغ المسترد",
          value: money(statsValue.refundedAmount),
        },
      ],
    },
    {
      key: "exchanges",
      label: "عدد الاستبدالات",
      value: count(statsValue.exchangesCount),
      accent: "sky",
      icon: "pi-sync",
      rows: [
        {
          label: "المسترد من الاستبدال",
          value: money(statsValue.exchangeRefundAmount),
        },
        {
          label: "المحصّل من الاستبدال",
          value: money(statsValue.exchangeCollectedAmount),
        },
      ],
    },
    {
      key: "damaged",
      label: "عدد المرتجعات التالفة",
      value: count(statsValue.damagedReturnsCount),
      accent: "rose",
      icon: "pi-exclamation-triangle",
      rows: [
        { label: "كمية التالف", value: count(statsValue.damagedQuantity) },
      ],
    },
    {
      key: "refundsTotal",
      label: "إجمالي المسترد",
      value: money(totalRefunded),
      accent: "rose",
      icon: "pi-undo",
      rows: [
        {
          label: "المبلغ المسترد",
          value: money(statsValue.refundedAmount),
        },
        {
          label: "المسترد من الاستبدال",
          value: money(statsValue.exchangeRefundAmount),
        },
      ],
    },
  ];
});
</script>
