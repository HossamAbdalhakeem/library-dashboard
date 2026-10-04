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
          :activating-id="activatingId"
          @edit="openEdit"
          @activate="handleActivate"
        />
      </template>
    </Card>

    <Drawer
      v-model:visible="drawerVisible"
      :header="drawerTitle"
      position="right"
      class="!w-[min(400px,100vw)] !max-w-[100vw]"
      :style="{ width: 'min(400px, 100vw)', maxWidth: '100vw' }"
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
const activatingId = ref(null);
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

const handleActivate = async (teacher) => {
  if (!teacher?.id || activatingId.value) return;
  activatingId.value = teacher.id;
  try {
    const result = await teacherApi.activateTeacher(teacher.id);
    const updated = normalizeTeacherListItem({
      ...(result || teacher),
      status: result?.status || "ACTIVE",
    });
    const index = teachers.value.findIndex((item) => item.id === teacher.id);
    if (index !== -1) {
      if (filters.status === "INACTIVE") teachers.value.splice(index, 1);
      else teachers.value.splice(index, 1, updated);
    }
    showSuccess("تم تفعيل المدرس بنجاح.");
  } catch (error) {
    showError(error?.message || "تعذر تفعيل المدرس.");
  } finally {
    activatingId.value = null;
  }
};

watch(currentAcademicYearId, () => {
  closeDrawer();
  loadTeachers();
});

onMounted(loadTeachers);
</script>
