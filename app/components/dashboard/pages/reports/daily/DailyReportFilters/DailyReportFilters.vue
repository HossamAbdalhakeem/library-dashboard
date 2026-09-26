<template>
  <div
    class="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
  >
    <AppPeriodDateFilter
      :from="from"
      :to="to"
      :periods="BRANCH_PERIODS"
      default-period="day"
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
} from "~/services/reports/shared";

defineOptions({ name: "DailyReportFilters" });

/** Branch employee reports: today, yesterday, last 7 days only. */
const BRANCH_PERIODS = ["day", "yesterday", "week"];

defineProps({
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["change", "refresh"]);

const { isLoggedIn } = useAuth();
const { academicYearId, academicYearStore } = useAcademicYear();

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
  from.value = nextFrom || todayInputValue();
  to.value = nextTo || nextFrom || todayInputValue();
  emitChange();
};

watch(academicYearId, () => {
  if (!ready.value || !isLoggedIn.value) return;
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
