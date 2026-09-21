<template>
  <Drawer
    v-model:visible="teacherDrawerVisible"
    header="إضافة مدرس"
    position="right"
    class="!w-[400px] max-w-[400px]"
    :style="{ width: '400px' }"
    :block-scroll="true"
    dir="rtl"
  >
    <TeacherForm
      v-if="teacherDrawerVisible"
      :locked-academic-year-id="teacherCreateAcademicYearId"
      @saved="$emit('teacher-saved', $event)"
      @cancel="teacherDrawerVisible = false"
    />
  </Drawer>

  <Drawer
    v-model:visible="studyYearDrawerVisible"
    header="إضافة سنة دراسية"
    position="right"
    class="!w-[400px] max-w-[400px]"
    :style="{ width: '400px' }"
    :block-scroll="true"
    dir="rtl"
  >
    <StudyYearForm
      v-if="studyYearDrawerVisible"
      @saved="$emit('study-year-saved', $event)"
      @cancel="studyYearDrawerVisible = false"
    />
  </Drawer>
</template>

<script setup>
import Drawer from "primevue/drawer";

const TeacherForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/teachers/TeacherForm.vue"),
);
const StudyYearForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/study-years/StudyYearForm.vue"),
);

defineProps({
  teacherCreateAcademicYearId: { type: [String, Number], default: null },
});

defineEmits(["teacher-saved", "study-year-saved"]);

const teacherDrawerVisible = defineModel("showTeacherDrawer", {
  type: Boolean,
  default: false,
});
const studyYearDrawerVisible = defineModel("showStudyYearDrawer", {
  type: Boolean,
  default: false,
});
</script>
