<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">المخزون</p>
      <p class="mt-1 text-xs text-slate-400">
        مستويات المخزون في نهاية الفترة المحددة (الإجمالي / المحجوز / المتاح)
      </p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Skeleton v-for="i in 3" :key="`inv-kpi-${i}`" height="4.5rem" />
      </div>
      <Skeleton width="100%" height="2.2rem" />
      <Skeleton width="100%" height="2.2rem" />
      <Skeleton width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات المخزون."
      @retry="reload"
    />

    <template v-else>
      <div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ReportKpiCard
          v-for="kpi in summaryKpis"
          :key="kpi.key"
          compact
          :label="kpi.label"
          :value="kpi.value"
          :accent="kpi.accent"
          :icon="kpi.icon"
        />
      </div>

      <InventoryTable :rows="rows" />
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { PRODUCT_TYPE_LABELS, ProductType } from "~/enums/productType";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import ReportKpiCard from "~/components/shared/admin-page/ReportsSummaryCards/partials/ReportKpiCard.vue";
import InventoryTable from "./partials/InventoryTable.vue";

defineOptions({ name: "ReportsInventoryTable" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getInventory(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المخزون.",
  },
);

const TYPE_META = {
  [ProductType.BOOK]: {
    icon: "pi-book",
    iconWrapClass: "bg-primary-500/15 text-primary-300",
  },
  [ProductType.CARD]: {
    icon: "pi-id-card",
    iconWrapClass: "bg-violet-500/15 text-violet-300",
  },
  [ProductType.BOOKLET]: {
    icon: "pi-file",
    iconWrapClass: "bg-amber-500/15 text-amber-300",
  },
};

const resolveTypeMeta = (typeKey) =>
  TYPE_META[String(typeKey || "").toUpperCase()] || {
    icon: "pi-box",
    iconWrapClass: "bg-slate-500/15 text-slate-300",
  };

const resolveAvailableClass = (available) => {
  const value = Number(available || 0);
  if (value <= 0) return "bg-rose-500/15 text-rose-300";
  if (value < 10) return "bg-amber-500/15 text-amber-300";
  return "bg-emerald-500/15 text-emerald-300";
};

const mapInventoryRow = (typeKey, bucket) => {
  const meta = resolveTypeMeta(typeKey);
  const available = bucket.available ?? 0;
  return {
    typeKey,
    type: PRODUCT_TYPE_LABELS[typeKey] || typeKey || "-",
    total: bucket.total ?? 0,
    reserved: bucket.reserved ?? 0,
    available,
    icon: meta.icon,
    iconWrapClass: meta.iconWrapClass,
    availableClass: resolveAvailableClass(available),
  };
};

const summary = computed(() => data.value?.summary || {});

const summaryKpis = computed(() => [
  {
    key: "total",
    label: "الإجمالي",
    value: summary.value.total ?? 0,
    accent: "sky",
    icon: "pi-box",
  },
  {
    key: "reserved",
    label: "محجوز",
    value: summary.value.reserved ?? 0,
    accent: "amber",
    icon: "pi-bookmark",
  },
  {
    key: "available",
    label: "متاح",
    value: summary.value.available ?? 0,
    accent: "emerald",
    icon: "pi-check-circle",
  },
]);

const rows = computed(() => {
  const byType = data.value?.byType;
  if (!Array.isArray(byType) || !byType.length) return [];
  return byType.map((row) =>
    mapInventoryRow(row.type, {
      total: row.total ?? 0,
      reserved: row.reserved ?? 0,
      available: row.available ?? 0,
    }),
  );
});
</script>
