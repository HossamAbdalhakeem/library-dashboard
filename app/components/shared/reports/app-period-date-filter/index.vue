<template>
  <div class="period-date-filter relative min-w-0" :class="wrapperClass">
    <Select
      :model-value="period"
      :options="periodOptions"
      option-label="label"
      option-value="value"
      placeholder="الفترة"
      :class="selectClass"
      @update:model-value="onPeriodChange"
    >
      <template #value="{ placeholder: valuePlaceholder }">
        <span class="truncate">{{ selectedPeriodLabel || valuePlaceholder }}</span>
      </template>
    </Select>

    <!-- Hidden host: only the overlay opens; no extra filter input in the bar -->
    <div class="period-custom-range-host" aria-hidden="true">
      <AppDateRangePicker
        ref="customRangeRef"
        label=""
        placeholder="اختر التاريخ المخصص"
        :from="from"
        :to="to"
        @update:from="emit('update:from', $event)"
        @update:to="emit('update:to', $event)"
        @change="onRangeChange"
      />
    </div>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import AppDateRangePicker from "~/components/shared/reports/app-date-range-picker/index.vue";

defineOptions({ name: "AppPeriodDateFilter" });

const props = defineProps({
  from: { type: String, default: null },
  to: { type: String, default: null },
  /** Initial preset when dates are empty: day | week | month | year */
  defaultPeriod: {
    type: String,
    default: "year",
    validator: (value) => ["day", "week", "month", "year"].includes(value),
  },
  /**
   * Academic-year date range used when period = year.
   * Expected shape: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
   */
  academicYearRange: {
    type: Object,
    default: null,
  },
  selectClass: {
    type: String,
    default: "w-full min-w-0",
  },
  wrapperClass: {
    type: String,
    default: "w-full",
  },
});

const emit = defineEmits(["update:from", "update:to", "update:period", "change"]);

const emitPeriod = (value) => {
  emit("update:period", value);
};

const customRangeRef = ref(null);
const period = ref(props.defaultPeriod);

const periodOptions = [
  { label: "اليوم", value: "day" },
  { label: "اسبوع", value: "week" },
  { label: "شهر", value: "month" },
  { label: "العام الدراسي", value: "year" },
  { label: "تاريخ مخصص", value: "custom" },
];

const formatDisplayDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${y}/${m}/${d}`;
};

const customRangeLabel = computed(() => {
  if (props.from && props.to) {
    return `${formatDisplayDate(props.from)} - ${formatDisplayDate(props.to)}`;
  }
  if (props.from) return formatDisplayDate(props.from);
  return "";
});

const selectedPeriodLabel = computed(() => {
  if (period.value === "custom") {
    return customRangeLabel.value || "تاريخ مخصص";
  }
  return (
    periodOptions.find((option) => option.value === period.value)?.label || ""
  );
});

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const rangeForPeriod = (value) => {
  const today = startOfToday();
  const to = toIsoDate(today);

  if (value === "day") {
    return { from: to, to };
  }

  if (value === "week") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: toIsoDate(from), to };
  }

  if (value === "month") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toIsoDate(from), to };
  }

  if (value === "year") {
    const ayFrom = props.academicYearRange?.from;
    const ayTo = props.academicYearRange?.to;
    if (ayFrom && ayTo) {
      return { from: String(ayFrom).slice(0, 10), to: String(ayTo).slice(0, 10) };
    }
    // Fallback when academic year dates are unavailable.
    const from = new Date(today.getFullYear(), 0, 1);
    return { from: toIsoDate(from), to };
  }

  return null;
};

const applyPreset = (value) => {
  const range = rangeForPeriod(value);
  if (!range) return;
  emit("update:from", range.from);
  emit("update:to", range.to);
  emitPeriod(value);
  emit("change", { ...range, period: value });
};

const openCustomPicker = async () => {
  await nextTick();
  customRangeRef.value?.open?.();
};

const onPeriodChange = async (value) => {
  period.value = value || props.defaultPeriod;
  emitPeriod(period.value);

  if (period.value === "custom") {
    await openCustomPicker();
    return;
  }

  applyPreset(period.value);
};

const onRangeChange = (payload) => {
  period.value = "custom";
  emitPeriod("custom");
  emit("change", { ...(payload || {}), period: "custom" });
};

const detectPeriodFromProps = () => {
  const from = props.from;
  const to = props.to;
  if (!from || !to) {
    period.value = props.defaultPeriod;
    return;
  }

  for (const option of ["day", "week", "month", "year"]) {
    const range = rangeForPeriod(option);
    if (range && range.from === from && range.to === to) {
      period.value = option;
      return;
    }
  }

  period.value = "custom";
};

onMounted(() => {
  detectPeriodFromProps();
  if (period.value === "custom") return;
  if (!props.from || !props.to) {
    applyPreset(period.value);
  }
});

watch(
  () => [
    props.academicYearRange?.from,
    props.academicYearRange?.to,
  ],
  () => {
    if (period.value !== "year") return;
    applyPreset("year");
  },
);
</script>

<style scoped>
.period-custom-range-host {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
</style>
