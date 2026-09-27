<template>
  <section class="flex w-full min-w-0 flex-col gap-4" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="font-bold text-[var(--app-text-strong)]">حجوزات المنتجات</p>
      <Button
        label="تصدير"
        icon="pi pi-file-excel"
        severity="secondary"
        size="small"
        :loading="exporting"
        :disabled="loading || exporting || !hasRows"
        @click="onExport"
      />
    </div>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 4" :key="`rs-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل حجوزات المنتجات."
      @retry="reload"
    />

    <p v-else-if="!hasRows" class="text-sm text-slate-500">
      لا توجد حجوزات بانتظار المخزون خلال الفترة المحددة.
    </p>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="branch in branches"
        :key="branch.branchId"
        class="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
      >
        <p class="text-base font-semibold text-[var(--app-text-strong)]">
          {{ branch.branchName }}
        </p>
        <ReservationsProductsTable :rows="branch.rows" />
      </div>

      <div
        v-if="bookRows.length"
        class="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
      >
        <p class="text-base font-semibold text-[var(--app-text-strong)]">
          كل الفروع حسب المنتج
        </p>
        <ReservationsProductsTable :rows="bookRows" />
      </div>
    </div>
  </section>
</template>

<script setup>
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import { useAppToast } from "~/composables/useAppToast";
import { triggerBlobDownload } from "~/composables/useEntityExport";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import ReservationsProductsTable from "./partials/ReservationsProductsTable.vue";

defineOptions({ name: "ReportsReservationsSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);
const { showError, showSuccess } = useAppToast();
const exporting = ref(false);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getReservationsByProduct(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل حجوزات المنتجات.",
  },
);

const toProductRow = (product) => ({
  productCell: {
    name: product.name,
    price: Number(product.price) > 0 ? formatMoney(product.price) : null,
    teacherName: product.teacherName || null,
    studyYearName: product.studyYearName || null,
  },
  count: product.count,
  paidLabel: formatMoney(product.paidAmount),
  remainingRaw: Number(product.remainingAmount || 0),
  remainingLabel: formatMoney(product.remainingAmount),
  waitingCount: product.waitingCount,
});

const branches = computed(() =>
  (Array.isArray(data.value?.branches) ? data.value.branches : []).map(
    (branch) => ({
      branchId: branch.branchId,
      branchName: branch.branchName,
      rows: (branch.products || []).map(toProductRow),
    }),
  ),
);

const bookRows = computed(() =>
  (Array.isArray(data.value?.productsByBook) ? data.value.productsByBook : []).map(
    toProductRow,
  ),
);

const hasRows = computed(() => branches.value.length > 0);

const onExport = async () => {
  if (exporting.value || !hasRows.value) return;
  exporting.value = true;
  try {
    const blob = await adminReportsApi.exportReservationsByProduct(props.params);
    triggerBlobDownload(blob, "reservations-by-product.xls");
    showSuccess("تم تصدير حجوزات المنتجات بنجاح.");
  } catch (err) {
    if (err?.code !== "SESSION_CLEARED" && err?.status !== 401) {
      showError(err?.message || "تعذر تصدير حجوزات المنتجات.");
    }
  } finally {
    exporting.value = false;
  }
};
</script>
