<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">الطلاب</span>
          <div class="flex flex-wrap items-center gap-2">
            <Button
              label="تصدير"
              icon="pi pi-download"
              severity="secondary"
              outlined
              data-testid="students-export"
              :disabled="!currentAcademicYearId"
              @click="openExport"
            />
            <Button
              label="إضافة طالب جديد"
              icon="pi pi-user-plus"
              severity="primary"
              data-testid="students-create"
              :disabled="!currentAcademicYearId"
              @click="openCreate"
            />
          </div>
        </div>
      </template>
      <template #content>
        <div class="mb-5 md:max-w-xl">
          <AppSearchInput
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

    <AppGlobalDrawer v-model:visible="drawerVisible" :title="drawerTitle">
      <StudentForm
        v-if="drawerVisible"
        :student="editingItem"
        @saved="handleSaved"
        @cancel="drawerVisible = false"
      />
    </AppGlobalDrawer>

    <StudentTransactionsDialog
      v-if="transactionsVisible"
      v-model:visible="transactionsVisible"
      :student="transactionsStudent"
      @hide="transactionsStudent = null"
    />

    <StudentsExportDialog
      v-if="exportVisible"
      v-model:visible="exportVisible"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import AppGlobalDrawer from "~/components/shared/drawer/app-global-drawer/index.vue";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import StudentsTable from "~/components/dashboard/pages/students/components/table/StudentsTable.vue";
import {
  studentApi,
  normalizeStudentListItem,
  buildStudentListQuery,
} from "~/services/student";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";

const StudentForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/students/components/form/StudentForm.vue"),
);
const StudentTransactionsDialog = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/students/components/partials/StudentTransactionsDialog.vue"
  ),
);
const StudentsExportDialog = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/students/components/partials/StudentsExportDialog.vue"
  ),
);

const { showError, showSuccess } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYear();
const loading = ref(true);
const deactivating = ref(false);
const drawerVisible = ref(false);
const transactionsVisible = ref(false);
const exportVisible = ref(false);
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

const loadData = async () => {
  if (!currentAcademicYearId.value) {
    students.value = [];
    pagination.total = 0;
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const result = await studentApi.getStudents(
      buildStudentListQuery({
        page: pagination.page,
        perPage: pagination.perPage,
        filters,
        includeInactive: true,
      }),
    );
    students.value = result.data.map(normalizeStudentListItem);
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

const openExport = () => {
  if (!currentAcademicYearId.value) {
    showError("اختر العام الدراسي أولاً.");
    return;
  }
  exportVisible.value = true;
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
    await studentApi.deleteStudent(item.id);
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
