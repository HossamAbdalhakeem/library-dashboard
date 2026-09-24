<template>
  <section class="space-y-4" dir="rtl">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <span
          class="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300"
        >
          تقارير الأداء
        </span>
        <h3 class="text-lg font-bold text-white">أهم المؤشرات</h3>
      </div>
    </div>

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="i in 4"
        :key="`kpi-skel-${i}`"
        class="rounded-2xl border border-white/10 bg-slate-900/80 p-4"
      >
        <Skeleton width="7rem" height="0.9rem" class="mb-3" />
        <Skeleton width="60%" height="1.8rem" />
      </div>
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="reload"
    />

    <div
      v-else
      class="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <ReportKpiCard
        compact
        accent="emerald"
        label="إجمالي المبيعات"
        :value="formatMoney(summary.totalSales, 'locale')"
        hint="بيع مباشر + تسليم حجز"
      />
      <ReportKpiCard
        compact
        accent="sky"
        label="إجمالي المدفوعات"
        :value="formatMoney(summary.totalPayments, 'locale')"
        hint="النقد المحصّل"
      />
      <ReportKpiCard
        compact
        accent="emerald"
        label="صافي الربح"
        :value="formatMoney(summary.netProfit, 'locale')"
        hint="بعد المصروفات"
      />
      <ReportKpiCard
        compact
        accent="amber"
        label="المبالغ المستحقة"
        :value="formatMoney(summary.outstandingAmount, 'locale')"
        hint="متبقي على الحجوزات المفتوحة"
      />
    </div>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportKpiCard from "./partials/ReportKpiCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import { adminReportsApi } from "~/services/reports/admin";
import { formatMoney } from "~/utils/format/money";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsSummaryCards" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getSummary(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المؤشرات.",
  },
);

const summary = computed(() => data.value || {});
</script>
