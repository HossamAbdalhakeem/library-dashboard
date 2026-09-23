<template>
  <div
    class="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
  >
    <AppPeriodDateFilter
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
import AppPeriodDateFilter from "~/components/shared/reports/app-period-date-filter/index.vue";
import { useAcademicYear } from "~/composables/useAcademicYear";
import { useAuth } from "~/composables/useAuth";
import {
  todayInputValue,
  buildReportDateRangeParams,
  fillMissingDateRange,
} from "~/services/reports/shared";

defineOptions({ name: "DailyReportFilters" });

defineProps({
  loading: { type: Boolean, default: false },
  /** day | week | month | year */
  defaultPeriod: { type: String, default: "day" },
});

const emit = defineEmits(["change", "refresh"]);

const { isLoggedIn } = useAuth();
const {
  academicYearId,
  academicYearStore,
  academicYearRange,
} = useAcademicYear();

const from = ref(todayInputValue());
const to = ref(todayInputValue());
const ready = ref(false);

const buildParams = () =>
  buildReportDateRangeParams({
    from: from.value,
    to: to.value,
    academicYearId: academicYearId.value,
  });

const emitChange = () => {
  emit("change", buildParams());
};

const onPeriodChange = ({ from: nextFrom, to: nextTo } = {}) => {
  from.value = nextFrom || null;
  to.value = nextTo || nextFrom || null;
  if (!from.value && !to.value) {
    const filled = fillMissingDateRange({
      academicYearRange: academicYearRange.value,
    });
    from.value = filled.from;
    to.value = filled.to;
  }
  emitChange();
};

watch(academicYearId, () => {
  if (!ready.value || !isLoggedIn.value) return;
  if (academicYearRange.value) {
    from.value = academicYearRange.value.from;
    to.value = academicYearRange.value.to;
  }
  emitChange();
});

onMounted(async () => {
  if (!isLoggedIn.value) return;
  await academicYearStore.fetchYears().catch(() => {});
  if (!isLoggedIn.value) return;
  ready.value = true;
  emitChange();
});

defineExpose({
  buildParams,
  from,
  to,
});
</script>
