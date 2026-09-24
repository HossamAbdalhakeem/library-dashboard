<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 min-w-0">
      <p class="font-bold text-white">{{ title }}</p>
      <p v-if="subtitle" class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
    </div>

    <div v-if="loading && !rows.length" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`refund-skel-${i}`" height="2.4rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="$emit('retry')"
    />

    <ReportsSectionEmpty
      v-else-if="!loading && !rows.length"
      :message="emptyMessage"
    />

    <RefundEventsTable
      v-else
      :rows="rows"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total-records="totalRecords"
      :total-amount="totalAmount"
      :empty-message="emptyMessage"
      @update:page="$emit('update:page', $event)"
    />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/ReportsSectionEmpty.vue";
import RefundEventsTable from "./partials/RefundEventsTable.vue";

defineOptions({ name: "DailyReportRefundEventsSection" });

defineProps({
  title: { type: String, default: "مرتجعات وإلغاءات اليوم" },
  subtitle: {
    type: String,
    default:
      "أحداث الاسترداد في الفترة — حتى لو كانت العملية الأصلية في يوم سابق",
  },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات استرداد أو إلغاء خلال الفترة المحددة.",
  },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  totalAmount: { type: [Number, String], default: 0 },
});

defineEmits(["retry", "update:page"]);
</script>
