<template>
  <div
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-5"
    dir="rtl"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="font-bold text-white">{{ title }}</p>
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
      <Line :data="chartData" :options="chartOptions" />
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
      pointBorderColor: "#111111",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      rtl: true,
      backgroundColor: "rgba(17, 17, 17, 0.95)",
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
        color: "#a3a3a3",
        font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
      },
      grid: {
        color: "rgba(163, 163, 163, 0.12)",
      },
      border: { color: "rgba(64, 64, 64, 0.6)" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#a3a3a3",
        font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
        callback(value) {
          return Number(value).toLocaleString("en-US");
        },
      },
      grid: {
        color: "rgba(163, 163, 163, 0.18)",
        drawBorder: false,
      },
      border: { color: "rgba(64, 64, 64, 0.6)" },
    },
  },
};

onMounted(loadSalesTrend);
</script>
