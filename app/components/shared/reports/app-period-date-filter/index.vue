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

    <div
      v-if="allowsCustom"
      class="period-custom-range-host"
      aria-hidden="true"
    >
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

const ALL_PERIOD_OPTIONS = [
  { label: "اليوم", value: "day" },
  { label: "أمس", value: "yesterday" },
  { label: "اسبوع", value: "week" },
  { label: "شهر", value: "month" },
  { label: "العام الدراسي", value: "year" },
  { label: "تاريخ مخصص", value: "custom" },
];

const props = defineProps({
  from: { type: String, default: null },
  to: { type: String, default: null },
  /**
   * Allowed period values. Defaults to admin set (no yesterday).
   * Branch reports pass: day | yesterday | week
   */
  periods: {
    type: Array,
    default: () => ["day", "week", "month", "year", "custom"],
  },
  /** Initial preset when dates are empty */
  defaultPeriod: {
    type: String,
    default: "day",
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

const periodOptions = computed(() =>
  ALL_PERIOD_OPTIONS.filter((option) => props.periods.includes(option.value)),
);

const allowsCustom = computed(() => props.periods.includes("custom"));

const resolveDefaultPeriod = () => {
  if (props.periods.includes(props.defaultPeriod)) return props.defaultPeriod;
  return periodOptions.value[0]?.value || "day";
};

const period = ref(resolveDefaultPeriod());

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
    periodOptions.value.find((option) => option.value === period.value)?.label ||
    ""
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

  if (value === "day" || value === "today") {
    return { from: to, to };
  }

  if (value === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const iso = toIsoDate(yesterday);
    return { from: iso, to: iso };
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
  period.value = value || resolveDefaultPeriod();
  emitPeriod(period.value);

  if (period.value === "custom") {
    if (!allowsCustom.value) {
      applyPreset(resolveDefaultPeriod());
      return;
    }
    await openCustomPicker();
    return;
  }

  applyPreset(period.value);
};

const onRangeChange = (payload) => {
  if (!allowsCustom.value) return;
  period.value = "custom";
  emitPeriod("custom");
  emit("change", { ...(payload || {}), period: "custom" });
};

const detectPeriodFromProps = () => {
  const from = props.from;
  const to = props.to;
  if (!from || !to) {
    period.value = resolveDefaultPeriod();
    return;
  }

  for (const option of periodOptions.value) {
    if (option.value === "custom") continue;
    const range = rangeForPeriod(option.value);
    if (range && range.from === from && range.to === to) {
      period.value = option.value;
      return;
    }
  }

  period.value = allowsCustom.value ? "custom" : resolveDefaultPeriod();
};

onMounted(() => {
  detectPeriodFromProps();
  if (period.value === "custom") return;
  if (!props.from || !props.to) {
    applyPreset(period.value);
  }
});

watch(
  () => [props.academicYearRange?.from, props.academicYearRange?.to],
  () => {
    if (period.value !== "year") return;
    if (!props.periods.includes("year")) return;
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
