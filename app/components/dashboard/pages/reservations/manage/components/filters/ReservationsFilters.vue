<template>
  <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    <AppSearchInput placeholder="رقم الحجز / طالب / منتج" @search="onSearch" />

    <AppGlobalSelectBranch
      :model-value="branchId"
      label="الفرع"
      placeholder="كل الفروع"
      show-clear
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
  </div>
</template>

<script setup>
import Select from "primevue/select";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import { RESERVATION_STATUS_LABELS } from "~/utils/domain-labels/reservation";

defineOptions({ name: "ReservationsFilters" });

defineProps({
  branchId: { type: [String, Number], default: null },
  teacherId: { type: [String, Number], default: null },
  studyYearId: { type: [String, Number], default: null },
  status: { type: String, default: null },
});

const emit = defineEmits([
  "update:branchId",
  "update:teacherId",
  "update:studyYearId",
  "update:status",
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
