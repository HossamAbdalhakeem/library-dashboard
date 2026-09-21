<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">الطلاب</span>
          <Button
            label="إضافة طالب جديد"
            icon="pi pi-user-plus"
            severity="primary"
            :disabled="!currentAcademicYearId"
            @click="openCreate"
          />
        </div>
      </template>
      <template #content>
        <div class="mb-5 md:max-w-xl">
          <SearchInput
            label="بحث"
            placeholder="ابحث بالاسم أو رقم الهاتف"
            @search="onSearch"
          />
        </div>

        <StudentsTable
          :students="students"
          :loading="loading"
          :deactivating="deactivating"
          :rows="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          @edit="openEdit"
          @deactivate="handleDeactivate"
          @transactions="openTransactions"
          @page="onPage"
        />
      </template>
    </Card>

    <EntityDrawer v-model:visible="drawerVisible" :title="drawerTitle">
      <StudentForm
        v-if="drawerVisible"
        :student="editingItem"
        @saved="handleSaved"
        @cancel="drawerVisible = false"
      />
    </EntityDrawer>

    <StudentTransactionsDialog
      v-if="transactionsVisible"
      v-model:visible="transactionsVisible"
      :student="transactionsStudent"
      @hide="transactionsStudent = null"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import EntityDrawer from "~/components/dashboard/EntityDrawer.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import StudentsTable from "~/components/dashboard/pages/students/StudentsTable.vue";
import { studentService } from "~/services/studentService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { getStatusTagLabel } from "~/utils/statusTags";

const StudentForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/students/StudentForm.vue"),
);
const StudentTransactionsDialog = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/students/StudentTransactionsDialog.vue"),
);

const { showError, showSuccess } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();
const loading = ref(true);
const deactivating = ref(false);
const drawerVisible = ref(false);
const transactionsVisible = ref(false);
const editingItem = ref(null);
const transactionsStudent = ref(null);
const students = ref([]);
const filters = reactive({
  search: "",
});
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});
const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل الطالب" : "إضافة طالب",
);

const normalizeStudent = (student) => ({
  ...student,
  name: student.name || "-",
  phone: student.phone || "-",
  studyYearName: student.studyYear?.name || "-",
  statusLabel: getStatusTagLabel("entity", student.status),
});

const loadData = async () => {
  if (!currentAcademicYearId.value) {
    students.value = [];
    pagination.total = 0;
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const result = await studentService.getStudents({
      ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
      page: pagination.page,
      per_page: pagination.perPage,
    });
    students.value = result.data.map(normalizeStudent);
    pagination.total = result.pagination.total;
  } catch (error) {
    showError(error?.message || "تعذر تحميل الطلاب.");
    students.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const resetPagination = () => {
  pagination.page = 1;
  pagination.first = 0;
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  loadData();
};

const onSearch = (value) => {
  filters.search = value;
  resetPagination();
  loadData();
};

const openCreate = () => {
  if (!currentAcademicYearId.value) {
    showError("اختر العام الدراسي أولاً.");
    return;
  }
  editingItem.value = null;
  drawerVisible.value = true;
};

const openEdit = (item) => {
  editingItem.value = item;
  drawerVisible.value = true;
};

const openTransactions = (item) => {
  transactionsStudent.value = item;
  transactionsVisible.value = true;
};

const handleSaved = async () => {
  const wasCreate = !editingItem.value?.id;
  drawerVisible.value = false;
  editingItem.value = null;
  showSuccess(wasCreate ? "تم إضافة الطالب بنجاح." : "تم حفظ الطالب بنجاح.");
  if (wasCreate) resetPagination();
  await loadData();
};

const handleDeactivate = async (item) => {
  if (!item?.id || deactivating.value) return;
  deactivating.value = true;
  try {
    await studentService.deleteStudent(item.id);
    showSuccess("تم تعطيل الطالب بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر تعطيل الطالب.");
  } finally {
    deactivating.value = false;
  }
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

watch(currentAcademicYearId, () => {
  drawerVisible.value = false;
  resetPagination();
  loadData();
});

onMounted(loadData);
</script>
