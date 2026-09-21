<template>
  <div
    class="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
  >
    <PeriodDateFilter
      :from="from"
      :to="to"
      :academic-year-range="academicYearRange"
      :default-period="defaultPeriod"
      wrapper-class="w-full min-w-0 sm:w-72 sm:shrink-0"
      select-class="w-full"
      @update:from="from = $event"
      @update:to="to = $event"
      @change="onPeriodChange"
    />

    <Button
      icon="pi pi-refresh"
      severity="secondary"
      class="h-11 w-11 shrink-0 self-end"
      :loading="loading"
      @click="emit('refresh')"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import { storeToRefs } from "pinia";
import PeriodDateFilter from "~/components/shared/period-date-filter/index.vue";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { useAcademicYearStore } from "~/store/academicYear.js";
import { useAuthStore } from "~/store/auth.js";

defineOptions({ name: "DailyReportFilters" });

defineProps({
  loading: { type: Boolean, default: false },
  /** day | week | month | year */
  defaultPeriod: { type: String, default: "day" },
});

const emit = defineEmits(["change", "refresh"]);

const authStore = useAuthStore();
const { academicYearId } = useAcademicYearId();
const academicYearStore = useAcademicYearStore();
const { years: academicYears } = storeToRefs(academicYearStore);

const toDateInput = (value) => {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayInputValue = () => toDateInput(new Date()) || "2026-01-01";

const from = ref(todayInputValue());
const to = ref(todayInputValue());
const ready = ref(false);

const academicYearRange = computed(() => {
  const id = academicYearId.value;
  if (!id) return null;
  const match = academicYears.value.find(
    (year) => String(year.id) === String(id),
  );
  if (!match) return null;
  const rangeFrom = toDateInput(match.startDate);
  const rangeTo = toDateInput(match.endDate);
  if (!rangeFrom || !rangeTo) return null;
  return { from: rangeFrom, to: rangeTo };
});

const buildParams = () => {
  const fromBase = from.value || to.value || todayInputValue();
  const toBase = to.value || from.value || todayInputValue();
  const params = {
    from: new Date(`${fromBase}T00:00:00`).toISOString(),
    to: new Date(`${toBase}T23:59:59.999`).toISOString(),
  };
  if (academicYearId.value) {
    params.academicYearId = String(academicYearId.value);
  }
  return params;
};

const emitChange = () => {
  emit("change", buildParams());
};

const onPeriodChange = ({ from: nextFrom, to: nextTo } = {}) => {
  from.value = nextFrom || null;
  to.value = nextTo || nextFrom || null;
  if (!from.value && !to.value) {
    if (academicYearRange.value) {
      from.value = academicYearRange.value.from;
      to.value = academicYearRange.value.to;
    } else {
      const fallback = todayInputValue();
      from.value = fallback;
      to.value = fallback;
    }
  }
  emitChange();
};

watch(academicYearId, () => {
  if (!ready.value || !authStore.isLoggedIn) return;
  if (academicYearRange.value) {
    from.value = academicYearRange.value.from;
    to.value = academicYearRange.value.to;
  }
  emitChange();
});

onMounted(async () => {
  if (!authStore.isLoggedIn) return;
  await academicYearStore.fetchYears().catch(() => {});
  if (!authStore.isLoggedIn) return;
  ready.value = true;
  emitChange();
});

defineExpose({
  buildParams,
  from,
  to,
});
</script>
