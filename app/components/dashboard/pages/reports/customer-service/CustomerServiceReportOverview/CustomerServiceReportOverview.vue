<template>
  <div>
    <DailyReportSkeleton v-if="loading && !summary" />

    <ReportsSectionError
      v-else-if="error && !summary"
      :message="error"
      @retry="reload"
    />

    <div v-else class="grid gap-4 xl:grid-cols-3 xl:items-start">
      <div class="flex flex-col gap-4 xl:col-span-1">
        <DailyReportHero
          :title="heroTitle"
          :payments-total="paymentsTotal"
          :refunds-total="refundsTotal"
          :chips="heroChips"
        />
      </div>
      <PaymentMethodsReport
        class="xl:col-span-2"
        :items="paymentMethodItems"
        :total-label="paymentTotalLabel"
      />
    </div>
  </div>
</template>

<script setup>
import {
  customerServiceReportsApi,
  normalizeCustomerServiceSummary,
  buildCustomerServiceHeroChips,
} from "~/services/reports/customer-service";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";

defineOptions({ name: "CustomerServiceReportOverview" });

const DailyReportSkeleton = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/daily/DailyReportShell/partials/DailyReportSkeleton.vue"
  ),
);
const DailyReportHero = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/daily/DailyReportShell/partials/DailyReportHero.vue"
  ),
);
const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment/payment-methods-report/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: null },
  reloadKey: { type: Number, default: 0 },
  heroTitle: { type: String, default: "مدفوعات حجوزاتك" },
  paymentTotalLabel: { type: String, default: "إجمالي المحصل" },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => customerServiceReportsApi.getSummary(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل ملخص التقرير.",
    toastOnError: true,
  },
);

const summary = computed(() =>
  data.value ? normalizeCustomerServiceSummary(data.value) : null,
);

const paymentsTotal = computed(() => summary.value?.paymentsTotal ?? 0);
const refundsTotal = computed(() => summary.value?.refundsTotal ?? 0);
const heroChips = computed(() =>
  buildCustomerServiceHeroChips(summary.value || {}),
);
const paymentMethodItems = computed(
  () => summary.value?.paymentsByMethod || [],
);
</script>
