import { inventoryService } from "~/services/inventoryService";
import { mapInventoryProductOption } from "~/utils/productOptions";
import { useAuthStore } from "~/store/auth";
import { useAppToast } from "~/composables/useAppToast";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

export function useSalesProductSelection(form) {
  const authStore = useAuthStore();
  const { showError } = useAppToast();

  const products = ref([]);
  const loadingProducts = ref(false);
  const quantityError = ref("");

  const branchId = computed(
    () =>
      authStore.user?.branch_id ||
      authStore.user?.branchId ||
      authStore.user?.branches?.[0]?.id ||
      null,
  );

  const canSelectProduct = computed(
    () =>
      Boolean(
        branchId.value &&
          form.studyYearId &&
          form.teacherId &&
          form.productType,
      ),
  );

  const productSelectHint = computed(() => {
    if (!branchId.value) return "لا يوجد فرع مرتبط بالمستخدم الحالي.";
    if (!form.studyYearId) return "اختر السنة الدراسية أولاً.";
    if (!form.teacherId) return "اختر المدرس أولاً.";
    if (!form.productType) return "اختر نوع المنتج أولاً.";
    return "";
  });

  const matchesProductFilters = (option) => {
    if (
      form.studyYearId &&
      String(option.studyYearId || "") !== String(form.studyYearId)
    ) {
      return false;
    }
    if (
      form.teacherId &&
      String(option.teacherId || "") !== String(form.teacherId)
    ) {
      return false;
    }
    if (
      form.productType &&
      String(option.type || "").toUpperCase() !==
        String(form.productType).toUpperCase()
    ) {
      return false;
    }
    return true;
  };

  const productOptions = computed(() =>
    products.value
      .map(mapInventoryProductOption)
      .filter((option) => option.value && matchesProductFilters(option)),
  );

  const selectedProductOption = computed(
    () =>
      productOptions.value.find((option) => option.value === form.productId) ||
      null,
  );

  const selectedProduct = computed(() => {
    const row = products.value.find(
      (item) =>
        (item.product?.id || item.productId || item.id) === form.productId,
    );
    return row?.product || row || null;
  });

  const maxQuantity = computed(() =>
    Math.max(1, Number(selectedProductOption.value?.availableQuantity || 1)),
  );

  const unitPrice = computed(() =>
    Number(
      selectedProduct.value?.sellingPrice ||
        selectedProductOption.value?.sellingPrice ||
        0,
    ),
  );

  const requiredAmount = computed(() =>
    Number((unitPrice.value * Number(form.quantity || 0)).toFixed(2)),
  );

  const clearProductSelection = () => {
    form.productId = null;
    products.value = [];
  };

  const loadProducts = async (search = "") => {
    if (!canSelectProduct.value) {
      products.value = [];
      return;
    }

    loadingProducts.value = true;
    try {
      const query = String(search || "").trim();
      const items = await inventoryService.getBranchInventory(branchId.value, {
        availableOnly: true,
        studyYearId: form.studyYearId,
        teacherId: form.teacherId,
        type: form.productType,
        ...(query ? { search: query } : {}),
      });
      products.value = Array.isArray(items) ? items : items?.data || [];

      if (
        form.productId &&
        !productOptions.value.some((option) => option.value === form.productId)
      ) {
        form.productId = null;
      }
    } finally {
      loadingProducts.value = false;
    }
  };

  const { run: onProductSearch } = useThrottledCallback((term) => {
    loadProducts(term).catch((error) => {
      showError(error?.message || "تعذر تحميل المنتجات.");
    });
  }, 400);

  const onStudyYearChange = (value) => {
    form.studyYearId = value || null;
    form.teacherId = null;
    form.productType = null;
    clearProductSelection();
  };

  const onTeacherChange = (value) => {
    form.teacherId = value || null;
    form.productType = null;
    clearProductSelection();
  };

  const onProductTypeChange = async (value) => {
    form.productType = value || null;
    form.productId = null;
    if (!canSelectProduct.value) {
      products.value = [];
      return;
    }
    try {
      await loadProducts();
    } catch (error) {
      showError(error?.message || "تعذر تحميل المنتجات.");
    }
  };

  const onProductChange = (productId) => {
    quantityError.value = "";
    form.productId = productId;
    const available = productOptions.value.find(
      (option) => option.value === productId,
    )?.availableQuantity;
    if (available != null && Number(form.quantity) > Number(available)) {
      form.quantity = Number(available);
    }
  };

  const validateQuantity = () => {
    quantityError.value = "";
    const available = Number(
      selectedProductOption.value?.availableQuantity || 0,
    );
    const qty = Number(form.quantity || 0);

    if (!selectedProductOption.value) {
      return false;
    }

    if (qty < 1) {
      quantityError.value = "الكمية يجب أن تكون 1 على الأقل.";
      return false;
    }

    if (qty > available) {
      quantityError.value = `الكمية المطلوبة أكبر من المتاح (${available}).`;
      return false;
    }

    return true;
  };

  watch(
    () => form.quantity,
    () => {
      if (selectedProductOption.value) {
        validateQuantity();
      }
    },
  );

  return {
    products,
    loadingProducts,
    quantityError,
    branchId,
    canSelectProduct,
    productSelectHint,
    productOptions,
    selectedProductOption,
    selectedProduct,
    maxQuantity,
    unitPrice,
    requiredAmount,
    clearProductSelection,
    loadProducts,
    onProductSearch,
    onStudyYearChange,
    onTeacherChange,
    onProductTypeChange,
    onProductChange,
    validateQuantity,
  };
}
