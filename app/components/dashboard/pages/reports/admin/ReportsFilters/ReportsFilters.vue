<template>
  <div
    class="reports-filters flex w-full min-w-0 flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center "
  >
    <AppGlobalSelectTeacher
      :model-value="teacher"
      label=""
      placeholder="كل المدرسين"
      show-clear
      wrapper-class="w-full min-w-0 lg:w-[18%] lg:shrink-0"
      select-class="w-full"
      @update:model-value="onTeacherChange"
    />
    <AppGlobalSelectStudyYear
      :model-value="studyYear"
      label=""
      placeholder="كل السنوات الدراسية"
      show-clear
      wrapper-class="w-full min-w-0 lg:w-[18%] lg:shrink-0"
      select-class="w-full"
      @update:model-value="onStudyYearChange"
    />
    <AppGlobalSelectProduct
      :model-value="book"
      source="catalog"
      variant="simple"
      name-only
      label=""
      placeholder="اختيار الكتاب"
      show-clear
      wrapper-class="w-full min-w-0 lg:w-[20%] lg:shrink-0"
      :catalog-query="productCatalogQuery"
      @update:model-value="onBookChange"
    />
    <AppGlobalSelectBranch
      :model-value="branch"
      label=""
      placeholder="كل الفروع"
      include-all-option
      all-option-label="كل الفروع"
      all-option-value="all"
      wrapper-class="w-full min-w-0 lg:w-[18%] lg:shrink-0"
      select-class="w-full"
      @update:model-value="onBranchChange"
    />

    <AppPeriodDateFilter
      v-if="showPeriod"
      :from="from"
      :to="to"
      :academic-year-range="academicYearRange"
      :default-period="defaultPeriod"
      wrapper-class="w-full min-w-0 lg:w-[18%] lg:shrink-0"
      select-class="w-full"
      @update:from="emit('update:from', $event)"
      @update:to="emit('update:to', $event)"
      @update:period="emit('update:period', $event)"
      @change="emit('change', $event)"
    />

    <Button
      v-if="searchMode"
      label="بحث"
      icon="pi pi-search"
      severity="primary"
      class="h-11 shrink-0 self-end"
      :loading="loading"
      @click="emit('search')"
    />
    <Button
      v-else
      icon="pi pi-refresh"
      severity="secondary"
      class="h-11 w-11 shrink-0 self-end"
      :loading="loading"
      @click="$emit('refresh')"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import AppPeriodDateFilter from "~/components/shared/reports/app-period-date-filter/index.vue";

defineOptions({ name: "ReportsFilters" });

const props = defineProps({
  book: { type: [String, Number], default: null },
  branch: { type: [String, Number], default: "all" },
  teacher: { type: [String, Number], default: null },
  studyYear: { type: [String, Number], default: null },
  from: { type: String, default: null },
  to: { type: String, default: null },
  period: { type: String, default: "day" },
  /** Initial preset. Reservations report starts on the academic year. */
  defaultPeriod: { type: String, default: "day" },
  academicYearRange: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  /** Hide the period control. Inventory is a current snapshot, so dates do not apply. */
  showPeriod: { type: Boolean, default: true },
  /** Keep dropdown changes local until the search button is pressed. */
  searchMode: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:book",
  "update:branch",
  "update:teacher",
  "update:studyYear",
  "update:from",
  "update:to",
  "update:period",
  "change",
  "refresh",
  "search",
]);

const productCatalogQuery = computed(() => ({
  ...(props.teacher ? { teacherId: props.teacher } : {}),
  ...(props.studyYear ? { studyYearId: props.studyYear } : {}),
}));

const notifyChange = () => {
  if (!props.searchMode) emit("change");
};

const onBookChange = (value) => {
  emit("update:book", value ?? null);
  notifyChange();
};

const onBranchChange = (value) => {
  emit("update:branch", value);
  notifyChange();
};

const onTeacherChange = (value) => {
  emit("update:teacher", value ?? null);
  emit("update:book", null);
  notifyChange();
};

const onStudyYearChange = (value) => {
  emit("update:studyYear", value ?? null);
  emit("update:book", null);
  notifyChange();
};
</script>
