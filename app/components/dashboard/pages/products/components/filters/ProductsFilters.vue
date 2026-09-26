<template>
  <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    <AppSearchInput
      placeholder="اسم المنتج"
      @search="onSearch"
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
  </div>
</template>

<script setup>
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";

defineOptions({ name: "ProductsFilters" });

defineProps({
  teacherId: { type: [String, Number], default: null },
  studyYearId: { type: [String, Number], default: null },
});

const emit = defineEmits([
  "update:teacherId",
  "update:studyYearId",
  "search",
  "change",
]);

const onSearch = (value) => {
  emit("search", value);
};

const onTeacherChange = (value) => {
  emit("update:teacherId", value);
};

const onStudyYearChange = (value) => {
  emit("update:studyYearId", value);
};
</script>
