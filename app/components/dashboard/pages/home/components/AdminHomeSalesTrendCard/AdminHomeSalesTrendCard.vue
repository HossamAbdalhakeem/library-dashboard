<template>
  <div
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-5"
    dir="rtl"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="font-bold text-[var(--app-text-strong)]">{{ title }}</p>
      <AppGlobalSelectBranch
        :model-value="branchId || 'all'"
        label=""
        placeholder="جميع الفروع"
        include-all-option
        all-option-label="جميع الفروع"
        all-option-value="all"
        wrapper-class="min-w-[10rem]"
        select-class="w-full text-sm"
        @update:model-value="onBranchChange"
      />
    </div>

    <AdminHomeSalesTrendSkeleton v-if="loading" />

    <div v-else class="h-56 w-full">
      <Line
        :key="isDark ? 'dark' : 'light'"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "vue-chartjs";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import { adminReportsApi } from "~/services/reports/admin";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

defineOptions({ name: "AdminHomeSalesTrendCard" });

const AdminHomeSalesTrendSkeleton = defineAsyncComponent(() =>
  import("./skeletons/AdminHomeSalesTrendSkeleton.vue"),
);

const props = defineProps({
  title: { type: String, default: "المبيعات خلال آخر 7 أيام" },
  lineColor: { type: String, default: "#f5af52" },
});

const { isDark } = useTheme();
const loading = ref(true);
const points = ref([]);
const branchId = ref(null);

const onBranchChange = (value) => {
  branchId.value = value === "all" || !value ? null : String(value);
  loadSalesTrend();
};

const loadSalesTrend = async () => {
  loading.value = true;
  try {
    const data = await adminReportsApi.getGeneralSalesTrend({
      branchId: branchId.value || undefined,
    });
    points.value = Array.isArray(data?.points) ? data.points : [];
  } catch {
    points.value = [];
  } finally {
    loading.value = false;
  }
};

const labels = computed(() =>
  (points.value || []).map((point) => point.label || point.date || ""),
);

const values = computed(() =>
  (points.value || []).map((point) => Number(point.amount || 0)),
);

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: "المبيعات",
      data: values.value,
      borderColor: props.lineColor,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return "rgba(245, 175, 82, 0.15)";
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom,
        );
        gradient.addColorStop(0, "rgba(245, 175, 82, 0.35)");
        gradient.addColorStop(1, "rgba(245, 175, 82, 0.02)");
        return gradient;
      },
      pointBackgroundColor: props.lineColor,
      pointBorderColor: isDark.value ? "#111111" : "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
    },
  ],
}));

const chartOptions = computed(() => {
  const tickColor = isDark.value ? "#a3a3a3" : "#52525b";
  const gridColor = isDark.value
    ? "rgba(163, 163, 163, 0.18)"
    : "rgba(82, 82, 91, 0.16)";
  const axisBorder = isDark.value
    ? "rgba(64, 64, 64, 0.6)"
    : "rgba(212, 212, 216, 0.95)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        backgroundColor: isDark.value
          ? "rgba(17, 17, 17, 0.95)"
          : "rgba(255, 255, 255, 0.96)",
        titleColor: isDark.value ? "#fafafa" : "#18181b",
        bodyColor: isDark.value ? "#e5e5e5" : "#3f3f46",
        borderColor: isDark.value ? "rgba(64, 64, 64, 0.8)" : "#e4e4e7",
        borderWidth: 1,
        titleFont: { family: "Tahoma, Segoe UI, sans-serif" },
        bodyFont: { family: "Tahoma, Segoe UI, sans-serif" },
        callbacks: {
          label(context) {
            const value = Number(context.parsed.y || 0);
            return value.toLocaleString("en-US");
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: tickColor,
          font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
        },
        grid: {
          color: isDark.value
            ? "rgba(163, 163, 163, 0.12)"
            : "rgba(82, 82, 91, 0.08)",
        },
        border: { color: axisBorder },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: tickColor,
          font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
          callback(value) {
            return Number(value).toLocaleString("en-US");
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        border: { color: axisBorder },
      },
    },
  };
});

onMounted(loadSalesTrend);
</script>
