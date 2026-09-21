<template>
  <div class="space-y-4" dir="rtl">
    <div class="flex flex-wrap items-center justify-end gap-3">
      <Button
        label="بحث عن منتج"
        icon="pi pi-search"
        severity="primary"
        outlined
        :disabled="hydratingProduct"
        @click="showSearchDialog = true"
      />
    </div>

    <div
      v-if="hydratingProduct"
      class="flex items-center justify-center gap-3 rounded-2xl border border-primary-400/20 bg-primary-500/10 px-4 py-6 text-primary-200"
    >
      <i class="pi pi-spin pi-spinner text-xl" />
      <span class="text-sm font-medium">جاري تحميل المنتج في نموذج الحجز…</span>
    </div>

    <div
      v-else-if="selectedProduct"
      class="rounded-2xl border border-primary-400/30 bg-primary-500/10 px-4 py-3 text-right text-slate-100"
    >
      <p class="mb-2 text-sm font-semibold text-primary-200">المنتج المحدد</p>
      <div class="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <p>
          <span class="text-slate-400">الاسم:</span>
          {{ selectedProduct.productName }}
        </p>
        <p>
          <span class="text-slate-400">الأستاذ:</span>
          {{ selectedProduct.teacherName || "-" }}
        </p>
        <p>
          <span class="text-slate-400">السنة:</span>
          {{ selectedProduct.studyYearName || "-" }}
        </p>
        <p>
          <span class="text-slate-400">الفرع:</span>
          {{ selectedProduct.branchName || "لم يُحدد بعد" }}
        </p>
        <p>
          <span class="text-slate-400">السعر:</span>
          {{ formatMoney(selectedProduct.sellingPrice) }}
        </p>
        <p v-if="selectedProduct.branchId != null">
          <span class="text-slate-400">المتاح:</span>
          {{ selectedProduct.availableQuantity }}
        </p>
      </div>
    </div>

    <div class="relative">
      <div
        v-if="hydratingProduct"
        class="absolute inset-0 z-10 flex min-h-[12rem] items-center justify-center rounded-xl bg-slate-950/40"
      >
        <i class="pi pi-spin pi-spinner text-3xl text-primary-300" />
      </div>

      <BookReservationPage
        title="احجز كتاب"
        show-header
        :initial-product="selectedProductId"
        :initial-selection="selectedProduct"
        @hydrating="onFormHydrating"
      />
    </div>

    <BookSearchDialog
      v-if="showSearchDialog"
      v-model:visible="showSearchDialog"
      @select="onProductSelect"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import BookReservationPage from "~/components/dashboard/pages/reservations/BookReservationPage.vue";
import { formatMoney } from "~/utils/format";

const BookSearchDialog = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/books/BookSearchDialog.vue"),
);

const route = useRoute();
const showSearchDialog = ref(false);
const selectedProduct = ref(null);
const hydratingProduct = ref(false);

const selectedProductId = computed(
  () => selectedProduct.value?.productId || route.query.book || "",
);

const onProductSelect = (selection) => {
  selectedProduct.value = selection || null;
  if (selection?.productId) {
    hydratingProduct.value = true;
  }
};

const onFormHydrating = (value) => {
  hydratingProduct.value = Boolean(value);
};
</script>
