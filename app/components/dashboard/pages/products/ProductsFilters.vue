<template>
  <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <SearchInput
      placeholder="اسم المنتج / مدرس / نوع / سنة"
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

    <AppGlobalSelectProductType
      :model-value="type"
      label="النوع"
      placeholder="كل الأنواع"
      show-clear
      @update:model-value="onTypeChange"
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
import SearchInput from "~/components/shared/search-input/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/app-global-select-study-year/index.vue";
import AppGlobalSelectProductType from "~/components/shared/app-global-select-product-type/index.vue";

defineOptions({ name: "ProductsFilters" });

defineProps({
  teacherId: { type: [String, Number], default: null },
  type: { type: String, default: null },
  studyYearId: { type: [String, Number], default: null },
});

const emit = defineEmits([
  "update:teacherId",
  "update:type",
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

const onTypeChange = (value) => {
  emit("update:type", value);
};

const onStudyYearChange = (value) => {
  emit("update:studyYearId", value);
};
</script>
