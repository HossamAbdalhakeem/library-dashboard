<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">المدرسون</span>
          <Button
            label="إضافة مدرس جديد"
            icon="pi pi-plus"
            severity="primary"
            :disabled="!currentAcademicYearId"
            @click="openCreate"
          />
        </div>
      </template>

      <template #content>
        <TeachersFilters
          v-model:status="filters.status"
          @search="onSearch"
          @change="loadTeachers"
        />

        <TeachersTable
          :teachers="teachers"
          :loading="loading"
          @edit="openEdit"
        />
      </template>
    </Card>

    <Drawer
      v-model:visible="drawerVisible"
      :header="drawerTitle"
      position="right"
      class="!w-[400px] max-w-[400px]"
      :style="{ width: '400px' }"
      :block-scroll="true"
    >
      <TeacherForm
        v-if="drawerVisible"
        :teacher="editingTeacher"
        :locked-academic-year-id="currentAcademicYearId"
        @saved="handleSaved"
        @cancel="closeDrawer"
      />
    </Drawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import TeachersFilters from "~/components/dashboard/pages/teachers/components/filters/TeachersFilters.vue";
import TeachersTable from "~/components/dashboard/pages/teachers/components/table/TeachersTable.vue";
import {
  teacherApi,
  normalizeTeacherListItem,
  buildTeacherListQuery,
} from "~/services/teacher";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";

const TeacherForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/teachers/components/form/TeacherForm.vue"),
);

const { showError, showSuccess } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYear();

const loading = ref(true);
const drawerVisible = ref(false);
const editingTeacher = ref(null);
const teachers = ref([]);
const filters = reactive({
  search: "",
  status: null,
});

const drawerTitle = computed(() =>
  editingTeacher.value?.id ? "تعديل المدرس" : "إضافة مدرس جديد",
);

const loadTeachers = async () => {
  if (!currentAcademicYearId.value) {
    teachers.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const list = await teacherApi.getTeachers(
      buildTeacherListQuery({
        academicYearId: currentAcademicYearId.value,
        filters,
      }),
    );
    teachers.value = list.map(normalizeTeacherListItem);
  } catch (error) {
    showError(error?.message || "تعذر تحميل المدرسين.");
    teachers.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  filters.search = value;
  loadTeachers();
};

const openCreate = () => {
  if (!currentAcademicYearId.value) {
    showError("اختر العام الدراسي أولاً.");
    return;
  }
  editingTeacher.value = null;
  drawerVisible.value = true;
};

const openEdit = (teacher) => {
  editingTeacher.value = teacher;
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  editingTeacher.value = null;
};

const handleSaved = async () => {
  closeDrawer();
  showSuccess("تم حفظ المدرس بنجاح.");
  await loadTeachers();
};

watch(currentAcademicYearId, () => {
  closeDrawer();
  loadTeachers();
});

onMounted(loadTeachers);
</script>
