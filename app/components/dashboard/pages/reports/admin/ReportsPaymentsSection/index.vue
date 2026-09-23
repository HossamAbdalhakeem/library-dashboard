<template>
  <section dir="rtl">
    <div
      v-if="loading"
      class="rounded-xl border border-white/10 bg-slate-900 p-4"
    >
      <Skeleton width="8rem" height="1rem" class="mb-3" />
      <Skeleton width="100%" height="6rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات طرق الدفع."
      @retry="reload"
    />

    <PaymentMethodsReport
      v-else
      :items="items"
      total-label="إجمالي المدفوعات"
      empty-message="لا توجد مدفوعات خلال الفترة المحددة."
    />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsPaymentsSection" });

const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment/payment-methods-report/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getPaymentMethods(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات طرق الدفع.",
  },
);

const items = computed(() => {
  if (Array.isArray(data.value?.payments) && data.value.payments.length) {
    return data.value.payments;
  }
  return Array.isArray(data.value?.paymentsByMethod)
    ? data.value.paymentsByMethod
    : [];
});
</script>
