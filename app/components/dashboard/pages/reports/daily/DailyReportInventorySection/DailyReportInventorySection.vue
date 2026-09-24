<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <p class="font-bold text-white">حركة المخزن</p>
        <p class="mt-0.5 text-xs text-slate-400">
          كميات الوارد والسحب والمرتجعات والاستبدالات — اضغط أي بطاقة للتفاصيل
        </p>
      </div>
    </div>
    <div v-if="hasData" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="item in series"
        :key="item.key"
        type="button"
        class="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-3 text-right transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
        @click="$emit('open-detail', item.sectionKey)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs text-slate-400">{{ item.label }}</p>
            <p class="mt-2 text-2xl font-extrabold text-white">
              {{ item.value }}
            </p>
          </div>
          <span
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            :class="item.iconWrapClass"
          >
            <i :class="['pi text-sm', item.icon]" />
          </span>
        </div>
        <div class="mt-3 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span
              class="h-1.5 w-1.5 rounded-full"
              :style="{ backgroundColor: item.color }"
            />
            <span class="text-xs text-slate-500">{{ item.hint }}</span>
          </div>
          <span class="text-[11px] text-slate-500">عرض</span>
        </div>
      </button>
    </div>
    <div
      v-else
      class="flex h-32 items-center justify-center text-sm text-slate-500"
    >
      لا توجد حركات مخزن لهذا اليوم
    </div>
  </div>
</template>

<script setup>
import {
  REPORT_ACTIVITY_KEY_LABELS,
  getReportMetricColor,
} from "~/utils/domain-labels/report";

defineOptions({ name: "DailyReportInventorySection" });

const INVENTORY_UI = {
  received: {
    hint: "كمية الوارد",
    icon: "pi-inbox",
    iconWrapClass: "bg-emerald-500/15 text-emerald-300",
    sectionKey: "received",
  },
  stockOut: {
    hint: "كمية السحب",
    icon: "pi-box",
    iconWrapClass: "bg-rose-500/15 text-rose-300",
    sectionKey: "stockOut",
  },
  returns: {
    hint: "عمليات مرتجع",
    icon: "pi-replay",
    iconWrapClass: "bg-amber-500/15 text-amber-300",
    sectionKey: "returns",
  },
  exchanges: {
    hint: "عمليات استبدال",
    icon: "pi-sync",
    iconWrapClass: "bg-primary-500/15 text-primary-300",
    sectionKey: "exchanges",
  },
};

const props = defineProps({
  inventory: { type: Array, default: () => [] },
});

defineEmits(["open-detail"]);

const series = computed(() =>
  (Array.isArray(props.inventory) ? props.inventory : []).map((item) => {
    const ui = INVENTORY_UI[item.key] || {
      hint: item.label,
      icon: "pi-box",
      iconWrapClass: "bg-slate-700/50 text-slate-300",
      sectionKey: item.key,
    };
    return {
      key: item.key,
      label: REPORT_ACTIVITY_KEY_LABELS[item.key] || item.label || item.key,
      value: Number(item.value ?? 0),
      color: getReportMetricColor(item.key),
      ...ui,
    };
  }),
);

const hasData = computed(() => series.value.some((item) => item.value > 0));
</script>
