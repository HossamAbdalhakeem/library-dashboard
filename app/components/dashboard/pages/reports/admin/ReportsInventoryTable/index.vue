<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">المخزون</p>
      <p class="mt-1 text-xs text-slate-400">
        نظرة سريعة على الإجمالي والمتاح والمحجوز والتنبيهات
      </p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Skeleton v-for="i in 5" :key="`inv-kpi-${i}`" height="4.5rem" />
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
      <div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
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

      <div class="overflow-hidden rounded-xl border border-white/5">
        <AppDataTable
          :value="rows"
          :columns="columns"
          empty-message="لا توجد بيانات مخزون."
        >
          <template #type="{ data }">
            <span class="inline-flex items-center justify-center gap-2">
              <span
                class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                :class="data.iconWrapClass"
              >
                <i :class="['pi text-xs', data.icon]" />
              </span>
              <span class="font-medium text-slate-100">{{ data.type }}</span>
            </span>
          </template>
          <template #available="{ data }">
            <span
              class="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg px-2 py-1 text-sm font-bold"
              :class="data.availableClass"
            >
              {{ data.available }}
            </span>
          </template>
        </AppDataTable>
      </div>
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { PRODUCT_TYPE_LABELS, ProductType } from "~/enums/productType";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ReportKpiCard from "~/components/dashboard/pages/reports/admin/ReportsSummaryCards/partials/ReportKpiCard.vue";

defineOptions({ name: "ReportsInventoryTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminInventory(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المخزون.",
  },
);

const columns = [
  { field: "type", header: "النوع", slot: "type" },
  { field: "total", header: "كل" },
  { field: "reserved", header: "محجوز" },
  { field: "available", header: "متاح", slot: "available" },
];

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
  // {
  //   key: "lowStock",
  //   label: "مخزون منخفض",
  //   value: summary.value.lowStock ?? 0,
  //   accent: "amber",
  //   icon: "pi-exclamation-triangle",
  // },
  // {
  //   key: "outOfStock",
  //   label: "نفد المخزون",
  //   value: summary.value.outOfStock ?? 0,
  //   accent: "rose",
  //   icon: "pi-times-circle",
  // },
]);

const emptyBucket = () => ({ total: 0, reserved: 0, available: 0 });

const rows = computed(() => {
  const inventory = data.value || {};
  if (Array.isArray(inventory.byType) && inventory.byType.length) {
    return inventory.byType.map((row) =>
      mapInventoryRow(row.type, {
        total: row.total ?? 0,
        reserved: row.reserved ?? 0,
        available: row.available ?? 0,
      }),
    );
  }

  return [
    mapInventoryRow(ProductType.BOOK, inventory.books || emptyBucket()),
    mapInventoryRow(ProductType.CARD, inventory.cards || emptyBucket()),
    mapInventoryRow(ProductType.BOOKLET, inventory.booklets || emptyBucket()),
  ];
});
</script>
