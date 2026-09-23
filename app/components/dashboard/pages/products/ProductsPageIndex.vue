<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">المنتجات</span>
          <Button
            label="إضافة منتج جديد"
            icon="pi pi-plus"
            severity="primary"
            @click="openCreate"
          />
        </div>
      </template>

      <template #content>
        <ProductsFilters
          v-model:teacher-id="filters.teacherId"
          v-model:type="filters.type"
          v-model:study-year-id="filters.studyYearId"
          @search="onSearch"
          @change="reloadProducts"
        />

        <ProductsTable
          :products="products"
          :loading="loading"
          :rows="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          @edit="openEdit"
          @page="onPage"
        />
      </template>
    </Card>

    <ProductDrawer
      v-if="drawerVisible"
      v-model:visible="drawerVisible"
      :product="editingProduct"
      :title="drawerTitle"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import ProductsFilters from "~/components/dashboard/pages/products/components/filters/ProductsFilters.vue";
import ProductsTable from "~/components/dashboard/pages/products/components/table/ProductsTable.vue";
import {
  productApi,
  normalizeProductListItem,
  buildProductListQuery,
} from "~/services/product";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";

const ProductDrawer = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/products/components/form/ProductDrawer.vue"),
);

const { showError, showSuccess } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYear();
const loading = ref(true);
const drawerVisible = ref(false);
const editingProduct = ref(null);
const products = ref([]);
const filters = reactive({
  search: "",
  teacherId: null,
  type: null,
  studyYearId: null,
});
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

const drawerTitle = computed(() =>
  editingProduct.value?.id ? "تعديل المنتج" : "إضافة منتج جديد",
);

const loadProducts = async () => {
  loading.value = true;
  try {
    const result = await productApi.getProducts(
      buildProductListQuery({
        page: pagination.page,
        perPage: pagination.perPage,
        filters,
      }),
    );
    products.value = result.data.map(normalizeProductListItem);
    pagination.total = result.pagination.total;
  } catch (error) {
    showError(error?.message || "تعذر تحميل المنتجات.");
    products.value = [];
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
  loadProducts();
};

const reloadProducts = () => {
  resetPagination();
  loadProducts();
};

const onSearch = (value) => {
  filters.search = value;
  resetPagination();
  loadProducts();
};

const openCreate = () => {
  editingProduct.value = null;
  drawerVisible.value = true;
};

const openEdit = (product) => {
  editingProduct.value = product;
  drawerVisible.value = true;
};

watch(drawerVisible, (visible) => {
  if (!visible) editingProduct.value = null;
});

watch(currentAcademicYearId, () => {
  filters.teacherId = null;
  resetPagination();
  loadProducts();
});

const handleSaved = async () => {
  showSuccess("تم حفظ المنتج بنجاح.");
  await loadProducts();
};

onMounted(loadProducts);
</script>
