<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">السنوات الدراسية</span>
          <Button label="إضافة سنة دراسية" icon="pi pi-plus" severity="primary" @click="openCreate" />
        </div>
      </template>
      <template #content>
        <div class="mb-5">
          <AppSearchInput
            placeholder="ابحث بالاسم"
            wrapper-class="md:max-w-sm"
            @search="search = $event"
          />
        </div>

        <StudyYearsTable :study-years="filteredYears" :loading="loading" @edit="openEdit" />
      </template>
    </Card>

    <AppGlobalDrawer
      v-model:visible="drawerVisible"
      :title="drawerTitle"
    >
      <StudyYearForm
        v-if="drawerVisible"
        :study-year="editingItem"
        @saved="handleSaved"
        @cancel="drawerVisible = false"
      />
    </AppGlobalDrawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import AppGlobalDrawer from "~/components/shared/drawer/app-global-drawer/index.vue";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import StudyYearsTable from "~/components/dashboard/pages/study-years/components/table/StudyYearsTable.vue";
import { studyYearApi } from "~/services/study-year";
import { useAppToast } from "~/composables/useAppToast";

const StudyYearForm = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/study-years/components/form/StudyYearForm.vue"
  ),
);

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const studyYears = ref([]);
const search = ref("");
const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل السنة الدراسية" : "إضافة سنة دراسية",
);

const filteredYears = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return studyYears.value;
  return studyYears.value.filter((item) => String(item.name || "").toLowerCase().includes(q));
});

const loadData = async () => {
  loading.value = true;
  try {
    studyYears.value = await studyYearApi.getStudyYears();
  } catch (error) {
    showError(error?.message || "تعذر تحميل السنوات الدراسية.");
    studyYears.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editingItem.value = null;
  drawerVisible.value = true;
};

const openEdit = (item) => {
  editingItem.value = item;
  drawerVisible.value = true;
};

const handleSaved = async () => {
  drawerVisible.value = false;
  editingItem.value = null;
  showSuccess("تم حفظ السنة الدراسية بنجاح.");
  await loadData();
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

onMounted(loadData);
</script>
