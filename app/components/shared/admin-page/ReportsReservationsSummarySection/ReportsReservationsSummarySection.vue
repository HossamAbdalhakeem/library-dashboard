<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-[var(--app-text-strong)]">الحجوزات</p>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="i in cards.length" :key="`res-kpi-${i}`" height="7.5rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات الحجوزات."
      @retry="emit('retry')"
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
import ReportsPairedMetricCard from "~/components/shared/admin-page/ReportsFinancialsSection/partials/ReportsPairedMetricCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";

defineOptions({ name: "ReportsReservationsSummarySection" });

const props = defineProps({
  summary: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

const emit = defineEmits(["retry"]);

const summary = computed(() => props.summary || {});

const count = (value) => value ?? 0;
const amount = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};
const money = (value) => formatMoney(value, "locale");

const cards = computed(() => {
  const summaryValue = summary.value;
  const openReservations =
    count(summaryValue.readyReservations) +
    count(summaryValue.waitingForStockReservations);
  const totalRefunded =
    amount(summaryValue.reservationRefundAmount) +
    amount(summaryValue.reservationExchangeRefundAmount);

  return [
    {
      key: "total",
      label: "عدد الحجوزات",
      value: count(summaryValue.totalReservations),
      accent: "sky",
      icon: "pi-book",
      hint: "حجوزات جديدة في الفترة، وليست مبيعات مكتملة",
      rows: [
        {
          label: "المدفوع",
          value: money(summaryValue.reservationPayments),
          hint: "كل النقد المحصّل على الحجوزات",
        },
        {
          label: "العربون",
          value: money(summaryValue.reservationDeposits),
          hint: "عربون الحجوزات التي ما زالت مفتوحة",
        },
      ],
    },
    {
      key: "delivered",
      label: "حجوزات مسلّمة",
      value: count(summaryValue.deliveredReservations),
      accent: "emerald",
      icon: "pi-check-circle",
      rows: [
        {
          label: "المدفوع عند التسليم",
          value: money(summaryValue.reservationDeliveryPayments),
        },
      ],
    },
    {
      key: "open",
      label: "حجوزات غير مسلّمة",
      value: openReservations,
      accent: "amber",
      icon: "pi-clock",
      rows: [
        { label: "جاهزة", value: count(summaryValue.readyReservations) },
        {
          label: "بانتظار المخزون",
          value: count(summaryValue.waitingForStockReservations),
        },
        {
          label: "المبالغ المستحقة",
          value: money(summaryValue.outstandingAmount),
        },
      ],
    },
    {
      key: "cancelled",
      label: "حجوزات ملغاة",
      value: count(summaryValue.cancelledReservations),
      accent: "rose",
      icon: "pi-times-circle",
      rows: [
        {
          label: "استرداد الحجوزات",
          value: money(summaryValue.reservationRefundAmount),
        },
      ],
    },
    {
      key: "exchanges",
      label: "استبدالات الحجوزات",
      value: count(summaryValue.reservationExchangesCount),
      accent: "sky",
      icon: "pi-sync",
      rows: [
        {
          label: "المسترد من الاستبدال",
          value: money(summaryValue.reservationExchangeRefundAmount),
        },
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
          label: "استرداد الحجوزات",
          value: money(summaryValue.reservationRefundAmount),
        },
        {
          label: "المسترد من الاستبدال",
          value: money(summaryValue.reservationExchangeRefundAmount),
        },
      ],
    },
  ];
});
</script>
