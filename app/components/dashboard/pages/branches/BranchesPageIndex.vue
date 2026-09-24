<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">الفروع</span>
          <Button
            label="إضافة فرع جديد"
            icon="pi pi-plus"
            severity="primary"
            @click="openCreate"
          />
        </div>
      </template>

      <template #content>
        <BranchesTable
          v-if="currentAcademicYearId"
          :branches="branches"
          :loading="loading"
          @edit="openEdit"
          @add-stock="openAddStock"
          @remove-stock="openRemoveStock"
        />
      </template>
    </Card>

    <AppGlobalDrawer v-model:visible="formDrawerVisible" :title="formDrawerTitle">
      <BranchForm
        v-if="formDrawerVisible"
        :branch="editingBranch"
        @saved="handleBranchSaved"
        @cancel="closeFormDrawer"
      />
    </AppGlobalDrawer>

    <Drawer
      v-model:visible="addDrawerVisible"
      header="إضافة منتج للفرع"
      position="right"
      :modal="true"
      :blockScroll="true"
      :baseZIndex="1400"
      class="branch-stock-drawer"
      :pt="{
        root: {
          class: 'branch-stock-drawer-panel',
          style: { width: '420px', maxWidth: '420px' },
        },
        header: { class: 'text-right' },
        content: { class: 'overflow-y-auto' },
      }"
    >
      <AddStockForm
        v-if="addDrawerVisible && selectedBranch"
        :locked-branch-id="selectedBranch.id"
        :branch-name="selectedBranch.name"
        @saved="handleAddSaved"
        @cancel="addDrawerVisible = false"
      />
    </Drawer>

    <Drawer
      v-model:visible="removeDrawerVisible"
      header="سحب منتج من الفرع"
      position="right"
      :modal="true"
      :blockScroll="true"
      :baseZIndex="1400"
      class="branch-stock-drawer"
      :pt="{
        root: {
          class: 'branch-stock-drawer-panel',
          style: { width: '420px', maxWidth: '420px' },
        },
        header: { class: 'text-right' },
        content: { class: 'overflow-y-auto' },
      }"
    >
      <RemoveStockForm
        v-if="removeDrawerVisible && selectedBranch"
        :locked-branch-id="selectedBranch.id"
        :branch-name="selectedBranch.name"
        @saved="handleRemoveSaved"
        @cancel="removeDrawerVisible = false"
      />
    </Drawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import AppGlobalDrawer from "~/components/shared/drawer/app-global-drawer/index.vue";
import { branchApi, normalizeBranchListItem } from "~/services/branch";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";

const BranchesTable = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/branches/components/table/BranchesTable.vue"),
);
const BranchForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/branches/components/form/BranchForm.vue"),
);
const AddStockForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/inventory/components/form/AddStockForm.vue"),
);
const RemoveStockForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/inventory/components/form/RemoveStockForm.vue"),
);

const { showError, showSuccess } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYear();
const loading = ref(true);
const branches = ref([]);
const selectedBranch = ref(null);
const editingBranch = ref(null);
const formDrawerVisible = ref(false);
const addDrawerVisible = ref(false);
const removeDrawerVisible = ref(false);

const formDrawerTitle = computed(() =>
  editingBranch.value?.id ? "تعديل الفرع" : "إضافة فرع جديد",
);

const loadData = async () => {
  if (!currentAcademicYearId.value) {
    branches.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const branchList = await branchApi.getBranches({
      inventory_summary: true,
    });

    branches.value = branchList.map(normalizeBranchListItem);
  } catch (error) {
    showError(error?.message || "تعذر تحميل الفروع.");
    branches.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editingBranch.value = null;
  formDrawerVisible.value = true;
};

const openEdit = (branch) => {
  editingBranch.value = branch;
  formDrawerVisible.value = true;
};

const closeFormDrawer = () => {
  formDrawerVisible.value = false;
  editingBranch.value = null;
};

const handleBranchSaved = async () => {
  closeFormDrawer();
  showSuccess("تم حفظ الفرع بنجاح.");
  await loadData();
};

const openAddStock = (branch) => {
  selectedBranch.value = branch;
  removeDrawerVisible.value = false;
  addDrawerVisible.value = true;
};

const openRemoveStock = (branch) => {
  selectedBranch.value = branch;
  addDrawerVisible.value = false;
  removeDrawerVisible.value = true;
};

const handleAddSaved = async () => {
  addDrawerVisible.value = false;
  selectedBranch.value = null;
  showSuccess("تم إضافة المنتج للفرع بنجاح.");
  await loadData();
};

const handleRemoveSaved = async () => {
  removeDrawerVisible.value = false;
  selectedBranch.value = null;
  showSuccess("تم سحب المنتج من الفرع بنجاح.");
  await loadData();
};

watch([addDrawerVisible, removeDrawerVisible], ([addVisible, removeVisible]) => {
  if (!addVisible && !removeVisible) selectedBranch.value = null;
});

watch(formDrawerVisible, (visible) => {
  if (!visible) editingBranch.value = null;
});

watch(currentAcademicYearId, () => {
  formDrawerVisible.value = false;
  addDrawerVisible.value = false;
  removeDrawerVisible.value = false;
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
:deep(.branch-stock-drawer-panel) {
  width: 420px !important;
  max-width: 420px !important;
}
</style>
