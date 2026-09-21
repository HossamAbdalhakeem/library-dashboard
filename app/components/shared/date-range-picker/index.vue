<template>
  <div class="flex flex-col gap-2 text-right" dir="rtl">
    <label v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</label>
    <DatePicker
      ref="pickerRef"
      v-model="rangeModel"
      selection-mode="range"
      :manual-input="false"
      show-icon
      show-clear
      icon-display="input"
      date-format="yy/mm/dd"
      :placeholder="placeholder"
      :show-button-bar="true"
      class="w-full"
      input-class="w-full"
      :number-of-months="monthCount"
      @date-select="onDateSelect"
      @clear="onClear"
      @hide="onHide"
    />
  </div>
</template>

<script setup>
import DatePicker from "primevue/datepicker";

defineOptions({ name: "DateRangePicker" });

const props = defineProps({
  /** ISO date string YYYY-MM-DD */
  from: { type: String, default: null },
  /** ISO date string YYYY-MM-DD */
  to: { type: String, default: null },
  label: { type: String, default: "من / إلى" },
  placeholder: { type: String, default: "اختر الفترة" },
});

const emit = defineEmits(["update:from", "update:to", "change"]);

const pickerRef = ref(null);
const suppressingWatch = ref(false);
const monthCount = ref(1);

const updateMonthCount = () => {
  if (!import.meta.client) return;
  monthCount.value = window.matchMedia("(min-width: 768px)").matches ? 2 : 1;
};

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const rangeModel = ref(null);

const syncFromProps = () => {
  const fromDate = toDate(props.from);
  const toDateValue = toDate(props.to);
  if (!fromDate && !toDateValue) {
    rangeModel.value = null;
    return;
  }
  rangeModel.value = [fromDate, toDateValue || fromDate].filter(Boolean);
};

watch(
  () => [props.from, props.to],
  () => {
    syncFromProps();
  },
  { immediate: true },
);

const emitRange = async ({ from, to } = {}) => {
  const range = Array.isArray(rangeModel.value) ? rangeModel.value : [];
  const nextFrom =
    from !== undefined ? from : toIsoDate(range[0] || null);
  const nextTo =
    to !== undefined ? to : toIsoDate(range[1] || range[0] || null);

  emit("update:from", nextFrom);
  emit("update:to", nextTo);
  await nextTick();
  emit("change", { from: nextFrom, to: nextTo });
};

const closePicker = async () => {
  await nextTick();
  const picker = pickerRef.value;
  if (!picker) return;
  if (typeof picker.hide === "function") {
    picker.hide();
    return;
  }
  if ("overlayVisible" in picker) {
    picker.overlayVisible = false;
  }
};

const onDateSelect = async () => {
  const range = Array.isArray(rangeModel.value) ? rangeModel.value : [];
  // Close only after both ends of the range are chosen
  if (!range[0] || !range[1]) return;
  await emitRange();
  await closePicker();
};

const onClear = async () => {
  suppressingWatch.value = true;
  rangeModel.value = null;
  await emitRange({ from: null, to: null });
  await nextTick();
  suppressingWatch.value = false;
};

const onHide = async () => {
  // Skip hide emit right after clear — onClear already refreshed the list
  if (!rangeModel.value) return;
  await emitRange();
};

// Fallback if PrimeVue clear doesn't fire @clear
watch(rangeModel, async (value, oldValue) => {
  if (suppressingWatch.value) return;
  const hadValue = Array.isArray(oldValue) && oldValue.some(Boolean);
  const isEmpty = !value || (Array.isArray(value) && !value.some(Boolean));
  if (!hadValue || !isEmpty) return;
  await emitRange({ from: null, to: null });
});

onMounted(() => {
  updateMonthCount();
  window.addEventListener("resize", updateMonthCount);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateMonthCount);
});

const open = () => {
  const picker = pickerRef.value;
  if (!picker) return;
  if (typeof picker.show === "function") {
    picker.show();
    return;
  }
  if ("overlayVisible" in picker) {
    picker.overlayVisible = true;
  }
};

defineExpose({ open });
</script>
