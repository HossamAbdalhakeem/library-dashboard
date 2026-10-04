<template>
  <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    <AppSearchInput placeholder="رقم الحجز / طالب / منتج" @search="onSearch" />

    <AppGlobalSelectBranch
      :model-value="branchId"
      label="الفرع"
      placeholder="كل الفروع"
      include-all-option
      all-option-label="كل الفروع"
      all-option-value="all"
      @update:model-value="onBranchChange"
      @change="$emit('change')"
    />

    <AppGlobalSelectTeacher
      :model-value="teacherId"
      label="المدرس"
      placeholder="كل المدرسين"
      show-clear
      @update:model-value="onTeacherChange"
      @change="$emit('change')"
    />

    <AppGlobalSelectStudyYear
      :model-value="studyYearId"
      label="السنة الدراسية"
      placeholder="كل السنوات"
      show-clear
      @update:model-value="onStudyYearChange"
      @change="$emit('change')"
    />

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">حالة الحجز</label>
      <Select
        :model-value="status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="كل الحالات"
        show-clear
        class="w-full"
        @update:model-value="onStatusChange"
      />
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الفترة</label>
      <AppPeriodDateFilter
        :from="from"
        :to="to"
        :academic-year-range="academicYearRange"
        :default-period="defaultPeriod"
        wrapper-class="w-full min-w-0"
        select-class="w-full"
        @update:from="emit('update:from', $event)"
        @update:to="emit('update:to', $event)"
        @update:period="emit('update:period', $event)"
        @change="emit('change')"
      />
    </div>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import AppPeriodDateFilter from "~/components/shared/reports/app-period-date-filter/index.vue";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import { RESERVATION_STATUS_LABELS } from "~/utils/domain-labels/reservation";

defineOptions({ name: "ReservationsFilters" });

defineProps({
  branchId: { type: [String, Number], default: "all" },
  teacherId: { type: [String, Number], default: null },
  studyYearId: { type: [String, Number], default: null },
  status: { type: String, default: null },
  from: { type: String, default: null },
  to: { type: String, default: null },
  academicYearRange: { type: Object, default: null },
  /** Same presets as admin reports. Reservations start on the academic year. */
  defaultPeriod: { type: String, default: "year" },
});

const emit = defineEmits([
  "update:branchId",
  "update:teacherId",
  "update:studyYearId",
  "update:status",
  "update:from",
  "update:to",
  "update:period",
  "search",
  "change",
]);

const statusOptions = Object.entries(RESERVATION_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const onSearch = (value) => {
  emit("search", value);
};

const onBranchChange = (value) => {
  emit("update:branchId", value ?? null);
};

const onTeacherChange = (value) => {
  emit("update:teacherId", value ?? null);
};

const onStudyYearChange = (value) => {
  emit("update:studyYearId", value ?? null);
};

const onStatusChange = (value) => {
  emit("update:status", value ?? null);
  emit("change");
};
</script>
