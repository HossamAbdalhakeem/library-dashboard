<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">اتجاه المبيعات</p>
      <p class="mt-1 text-xs text-slate-400">
        {{ granularityLabel }}
      </p>
    </div>

    <div v-if="loading" class="h-56">
      <Skeleton width="100%" height="100%" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="reload"
    />

    <div v-else class="h-56 w-full">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </section>
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
import Skeleton from "primevue/skeleton";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

defineOptions({ name: "ReportsSalesTrendSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
  lineColor: { type: String, default: "#f5af52" },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getSalesTrend(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل اتجاه المبيعات.",
  },
);

const points = computed(() => {
  if (Array.isArray(data.value)) return data.value;
  if (Array.isArray(data.value?.points)) return data.value.points;
  return [];
});

const granularityLabel = computed(() => {
  const g = data.value?.granularity;
  if (g === "hourly") return "تجميع بالساعة";
  if (g === "monthly") return "تجميع شهري";
  return "تجميع يومي";
});

const chartData = computed(() => {
  const series = points.value.length
    ? points.value
    : [{ label: "—", sales: 0 }];

  return {
    labels: series.map((p) => p.label || p.date || ""),
    datasets: [
      {
        label: "المبيعات",
        data: series.map((p) => Number(p.sales || 0)),
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
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      rtl: true,
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      callbacks: {
        label(context) {
          return Number(context.parsed.y || 0).toLocaleString("en-US");
        },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#a3a3a3", font: { size: 11 } },
      grid: { color: "rgba(163, 163, 163, 0.12)" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#a3a3a3",
        font: { size: 11 },
        callback(value) {
          return Number(value).toLocaleString("en-US");
        },
      },
      grid: { color: "rgba(163, 163, 163, 0.18)" },
    },
  },
};
</script>
