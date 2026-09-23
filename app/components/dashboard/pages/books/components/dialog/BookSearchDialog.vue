<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="بحث عن منتج"
    :style="{ width: 'min(1100px, 96vw)' }"
    :pt="{
      header: { class: 'text-right' },
      content: { class: 'text-right' },
    }"
    @update:visible="$emit('update:visible', $event)"
    @show="onShow"
  >
    <div class="flex flex-col gap-4">
      <BookSearchToolbar
        v-model:search="search"
        :total="books.length"
        @search="searchBooks"
      />

      <AppDataTable
        :value="books"
        :columns="bookColumns"
        :loading="pending"
        :empty-message="emptyMessage"
        :skeleton-rows="4"
      >
        <template #product="{ data }">
          <AppProductTableCell :product="data.productCell" />
        </template>
        <template #status="{ data }">
          <AppStatusTableCell
            kind="product-availability"
            :code="data.status"
            :label="data.statusLabel"
          />
        </template>
        <template #branches="{ data }">
          <BookSearchBranchesCell
            :product="data"
            @select="(branch) => selectBranch(data, branch)"
          />
        </template>
      </AppDataTable>
    </div>

    <template #footer>
      <BookSearchFooter @close="$emit('update:visible', false)" />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import BookSearchToolbar from "./partials/BookSearchToolbar.vue";
import BookSearchBranchesCell from "./partials/BookSearchBranchesCell.vue";
import BookSearchFooter from "./partials/BookSearchFooter.vue";
import {
  bookApi,
  normalizeBookSearchItem,
  buildBookSelection,
  buildBookSearchQuery,
} from "~/services/book";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "BookSearchDialog" });

defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "select"]);

const { showError } = useAppToast();
const pending = ref(false);
const search = ref("");
const books = ref([]);

const bookColumns = [
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "branches", header: "الفروع / الحجز", slot: "branches" },
];

const emptyMessage = computed(() =>
  search.value.trim()
    ? "لا توجد منتجات مطابقة"
    : "لا توجد منتجات متاحة.",
);

const selectBranch = (product, branch) => {
  if (!product?.reservationAllowed) return;
  emit("select", buildBookSelection(product, branch));
  emit("update:visible", false);
};

const searchBooks = async (term = search.value) => {
  const query = String(term ?? "").trim();
  search.value = query;

  pending.value = true;
  try {
    const result = await bookApi.searchBooks(buildBookSearchQuery(query));
    books.value = (result?.data || []).map(normalizeBookSearchItem);
  } catch (error) {
    books.value = [];
    showError(error?.message || "تعذر البحث في المنتجات.");
  } finally {
    pending.value = false;
  }
};

const onShow = () => {
  search.value = "";
  searchBooks("");
};
</script>
