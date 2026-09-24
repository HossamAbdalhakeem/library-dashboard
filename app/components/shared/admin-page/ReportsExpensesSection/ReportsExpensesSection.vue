<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">المصروفات</p>
    </div>

    <div v-if="loading">
      <Skeleton height="3.5rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات المصروفات."
      @retry="reload"
    />

    <template v-else>
      <div
        class="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-slate-950/70 px-4 py-3 shadow-[0_0_24px_-8px_rgba(251,191,36,0.3)]"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300"
          >
            <i class="pi pi-file text-sm" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm text-slate-400">إجمالي المصروفات</p>
            <p class="mt-0.5 text-xl font-extrabold text-amber-300">
              {{ formatMoney(expenses.totalExpenses, "locale") }}
            </p>
          </div>
        </div>
        <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
      </div>

      <div v-if="byBranch.length" class="mt-4">
        <ExpensesByBranchTable :rows="byBranch" />
      </div>
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import ExpensesByBranchTable from "./partials/ExpensesByBranchTable.vue";

defineOptions({ name: "ReportsExpensesSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getExpenses(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المصروفات.",
  },
);

const expenses = computed(() => data.value || {});

const byBranch = computed(() =>
  (Array.isArray(data.value?.expensesByBranch)
    ? data.value.expensesByBranch
    : []
  ).map((row) => ({
    ...row,
    amountLabel: formatMoney(row.amount, "locale"),
  })),
);
</script>
