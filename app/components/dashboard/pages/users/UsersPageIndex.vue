<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">المستخدمون</span>
          <Button label="إضافة مستخدم" icon="pi pi-plus" severity="primary" @click="openCreate" />
        </div>
      </template>
      <template #content>
        <div class="mb-5">
          <AppSearchInput placeholder="اسم / بريد" @search="onSearch" />
        </div>

        <UsersTable :users="users" :loading="loading" @edit="openEdit" />
      </template>
    </Card>

    <AppGlobalDrawer v-model:visible="drawerVisible" :title="drawerTitle" width="420px">
      <UserForm
        v-if="drawerVisible"
        :user="editingItem"
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
import UsersTable from "~/components/dashboard/pages/users/components/table/UsersTable.vue";
import {
  userApi,
  normalizeUserListItem,
  buildUserListQuery,
} from "~/services/user";
import { useAppToast } from "~/composables/useAppToast";
import { isAdminRole } from "~/enums/userRole";

const UserForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/users/components/form/UserForm.vue"),
);

const { showError, showSuccess } = useAppToast();

const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const users = ref([]);
const filters = reactive({
  search: "",
});

const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل المستخدم" : "إضافة مستخدم",
);

const loadData = async () => {
  loading.value = true;
  try {
    const list = await userApi.getUsers(buildUserListQuery({ filters }));
    users.value = list
      .filter((user) => !isAdminRole(user.role))
      .map(normalizeUserListItem);
  } catch (error) {
    showError(error?.message || "تعذر تحميل المستخدمين.");
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  filters.search = value;
  loadData();
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
  showSuccess("تم حفظ المستخدم بنجاح.");
  await loadData();
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

onMounted(loadData);
</script>
