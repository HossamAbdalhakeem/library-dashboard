<template>
  <div
    class="group rounded-2xl border border-white/[0.06] bg-slate-950/60 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-slate-900/70"
    dir="rtl"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400"
        >
          <i class="pi pi-building text-base" />
        </div>

        <div>
          <p class="font-semibold text-white">
            {{ branch.branchName }}
          </p>
          <p class="mt-0.5 text-xs text-slate-500">التقرير</p>
        </div>
      </div>

      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition group-hover:bg-white/5 group-hover:text-white"
      >
        <i class="pi pi-angle-left text-sm" />
      </span>
    </div>

    <!-- Main metric -->
    <div
      class="mt-4 flex items-end justify-between rounded-xl bg-white/[0.025] px-3 py-3"
    >
      <div>
        <p class="text-xs text-slate-500">إجمالي الحجوزات</p>
        <p class="mt-1 text-2xl font-bold tracking-tight text-white">
          {{ Number(branch.reservations || 0) }}
        </p>
      </div>

      <div
        class="flex items-center gap-1.5 rounded-lg bg-primary-500/10 px-2.5 py-1.5 text-xs font-medium text-primary-300"
      >
        <i class="pi pi-calendar text-xs" />
        اليوم
      </div>
    </div>

    <!-- Reservation status -->
    <div class="mt-3 grid grid-cols-3 gap-2">
      <DailyReportBranchStatCard
        v-for="stat in statusStats"
        :key="stat.key"
        :label="stat.label"
        :value="stat.value"
        :tone="stat.tone"
      />
    </div>

    <!-- Secondary info -->
    <div
      class="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3"
    >
      <div class="flex items-center gap-2 text-sm">
        <div
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10"
        >
          <i class="pi pi-sync text-xs text-indigo-400" />
        </div>

        <span class="text-slate-400">استبدالات</span>
      </div>

      <span class="font-semibold text-white">
        {{ Number(branch.exchanges || 0) }}
      </span>
    </div>

    <!-- Financial -->
    <div class="mt-2 rounded-xl bg-white/[0.025] px-3 py-2.5">
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-500">صافي المدفوعات</span>

        <span class="font-bold text-emerald-400">
          {{ formatMoney(netPayments, "rtl") }}
        </span>
      </div>

      <div class="mt-1.5 flex items-center justify-between text-[11px]">
        <span class="text-slate-600">
          مدفوع {{ formatMoney(branch.paidTotal, "rtl") }}
        </span>

        <span class="text-rose-400/70">
          مسترد {{ formatMoney(branch.refundsTotal, "rtl") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format";

defineOptions({ name: "DailyReportBranchCard" });

const DailyReportBranchStatCard = defineAsyncComponent(() =>
  import("./partials/DailyReportBranchStatCard.vue"),
);

const props = defineProps({
  branch: { type: Object, required: true },
});

const statusStats = computed(() => [
  {
    key: "delivered",
    label: "مسلّمة",
    value: props.branch?.delivered ?? 0,
    tone: "emerald",
  },
  {
    key: "ready",
    label: "جاهزة",
    value: props.branch?.ready ?? 0,
    tone: "amber",
  },
  {
    key: "cancelled",
    label: "ملغاة",
    value: props.branch?.cancelled ?? 0,
    tone: "rose",
  },
]);

const netPayments = computed(
  () =>
    Number(props.branch?.paidTotal || 0) -
    Number(props.branch?.refundsTotal || 0),
);
</script>
