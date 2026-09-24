<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">أحدث العمليات</p>
      <p class="mt-0.5 text-xs text-slate-400">آخر 5 عمليات عبر النظام</p>
    </div>

    <AdminHomeRecentOperationsSkeleton v-if="loading" />

    <div v-else class="rounded-2xl border border-white/10 bg-slate-900/90 p-4">
      <RecentOperationsTable :rows="displayRows" />
    </div>
  </section>
</template>

<script setup>
import { formatMoney } from "~/utils/format/money";
import { isFiniteNumber } from "~/utils/format/number";
import { getTransactionTypeLabel } from "~/utils/domain-labels/transaction";
import { getReservationStatusLabel } from "~/utils/domain-labels/reservation";
import { adminReportsApi } from "~/services/reports/admin";
import RecentOperationsTable from "./partials/RecentOperationsTable.vue";

defineOptions({ name: "AdminHomeRecentOperationsSection" });

const AdminHomeRecentOperationsSkeleton = defineAsyncComponent(() =>
  import("./skeletons/AdminHomeRecentOperationsSkeleton.vue"),
);

const loading = ref(true);
const recentOperations = ref([]);

const RESERVATION_TYPE_KEYS = new Set([
  "DELIVERED",
  "CANCELLED",
  "READY",
  "PENDING",
  "WAITING_FOR_STOCK",
]);

const OUTFLOW_TYPES = new Set(["RETURN", "CANCELLED", "REFUND"]);

const resolveTypeLabel = (type) => {
  const key = String(type || "").toUpperCase();
  if (!key) return "—";
  if (RESERVATION_TYPE_KEYS.has(key)) return getReservationStatusLabel(key);
  return getTransactionTypeLabel(key);
};

const resolveAmount = (row) => {
  if (row.amountRaw != null && isFiniteNumber(row.amountRaw)) {
    return Number(row.amountRaw);
  }
  if (typeof row.amount === "number" && isFiniteNumber(row.amount)) {
    return row.amount;
  }
  if (row.amount != null && row.amount !== "" && row.amount !== "—") {
    const parsed = Number(row.amount);
    if (isFiniteNumber(parsed)) return parsed;
  }
  return null;
};

const resolveAmountClass = (typeKey, amount) => {
  if (amount == null) return "text-slate-500";
  if (OUTFLOW_TYPES.has(typeKey) || amount < 0) return "text-rose-400";
  if (amount === 0) return "text-slate-400";
  return "text-emerald-400";
};

const displayRows = computed(() =>
  (recentOperations.value || []).map((row, index) => {
    const typeKey = String(row.type || "").toUpperCase();
    const amount = resolveAmount({
      amountRaw: row.amount == null ? null : Number(row.amount),
      amount: row.amount,
    });

    return {
      id: index + 1,
      time: row.time || null,
      typeKey,
      typeLabel: resolveTypeLabel(typeKey),
      student: row.student || "—",
      product: row.product || "—",
      amountLabel: amount == null ? "—" : formatMoney(amount, "rtl"),
      amountClass: resolveAmountClass(typeKey, amount),
      branch: row.branch || "—",
    };
  }),
);

const loadRecentOperations = async () => {
  loading.value = true;
  try {
    const data = await adminReportsApi.getGeneralRecentOperations();
    recentOperations.value = Array.isArray(data) ? data : [];
  } catch {
    recentOperations.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadRecentOperations);
</script>
